import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Verify stripe webhook signature
const verifyStripeSignature = (req) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
        console.warn('Missing Stripe webhook secret');
        return true; // Skip verification in development
    }
    
    try {
        const signedPayload = `${payload}${endpointSecret}`;
        const expectedSignature = crypto
            .createHmac('sha256', endpointSecret)
            .update(signedPayload)
            .digest('hex');
            
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(sig)
        );
    } catch (err) {
        console.error('Stripe signature verification failed:', err);
        return false;
    }
};

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        if (!verifyStripeSignature(req)) {
            return res.status(400).send('Invalid signature');
        }
        
        const event = req.body;
        
        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                
                // Update transaction status
                if (paymentIntent.metadata.transactionId) {
                    await supabase
                        .from('transactions')
                        .update({ 
                            status: 'completed',
                            payment_id: paymentIntent.id
                        })
                        .eq('id', paymentIntent.metadata.transactionId);
                }
                
                // Update subscription if applicable
                if (paymentIntent.metadata.subscriptionId) {
                    await supabase
                        .from('subscriptions')
                        .update({ 
                            status: 'active',
                            payment_id: paymentIntent.id
                        })
                        .eq('id', paymentIntent.metadata.subscriptionId);
                    
                    // Also update the user's profile
                    if (paymentIntent.metadata.userId && paymentIntent.metadata.planName) {
                        await supabase
                            .from('profiles')
                            .update({ 
                                is_subscribed: true,
                                subscription_tier: paymentIntent.metadata.planName
                            })
                            .eq('id', paymentIntent.metadata.userId);
                    }
                }
                break;
                
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('Payment failed:', failedPayment.id);
                
                // Update transaction status
                if (failedPayment.metadata.transactionId) {
                    await supabase
                        .from('transactions')
                        .update({ 
                            status: 'failed',
                            payment_id: failedPayment.id
                        })
                        .eq('id', failedPayment.metadata.transactionId);
                }
                
                // Update subscription if applicable
                if (failedPayment.metadata.subscriptionId) {
                    await supabase
                        .from('subscriptions')
                        .update({ 
                            status: 'failed',
                            payment_id: failedPayment.id
                        })
                        .eq('id', failedPayment.metadata.subscriptionId);
                }
                break;
                
            case 'subscription.created':
            case 'subscription.updated':
            case 'subscription.deleted':
                // Handle stripe subscription lifecycle events
                const subscription = event.data.object;
                console.log(`Subscription ${event.type}:`, subscription.id);
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
