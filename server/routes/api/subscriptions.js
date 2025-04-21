import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { body, validationResult } from 'express-validator';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get subscription plans
router.get('/plans', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price', { ascending: true });
            
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get subscription plans error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current user subscription
router.get('/current', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
                *,
                plan:subscription_plans(*)
            `)
            .eq('profile_id', req.user.id)
            .is('cancelled_at', null)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();
            
        if (error) throw error;
        res.json(data || { active: false });
    } catch (error) {
        console.error('Get current subscription error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Subscribe to a plan
router.post('/subscribe', [
    body('plan_id').isUUID(),
    body('payment_method_id').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { plan_id, payment_method_id } = req.body;
        
        // Get plan details
        const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', plan_id)
            .single();
            
        if (planError) throw planError;
        
        // Calculate expiration date based on plan duration
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (plan.duration_days || 30));
        
        // Create subscription record
        const subscriptionData = {
            profile_id: req.user.id,
            plan_id,
            status: 'active',
            payment_method_id,
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            price_paid: plan.price
        };
        
        const { data, error } = await supabase
            .from('subscriptions')
            .insert(subscriptionData)
            .select()
            .single();
            
        if (error) throw error;
        
        // Update user's subscription status in profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
                is_subscribed: true,
                subscription_tier: plan.name 
            })
            .eq('id', req.user.id);
            
        if (profileError) throw profileError;
        
        res.status(201).json({ 
            message: 'Subscription successful', 
            subscription: data 
        });
    } catch (error) {
        console.error('Subscription error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
    try {
        // Get current subscription
        const { data: subscription, error: fetchError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('profile_id', req.user.id)
            .is('cancelled_at', null)
            .gt('expires_at', new Date().toISOString())
            .single();
            
        if (fetchError) throw fetchError;
        
        if (!subscription) {
            return res.status(404).json({ error: 'No active subscription found' });
        }
        
        // Update subscription with cancelled_at
        const { data, error } = await supabase
            .from('subscriptions')
            .update({ 
                cancelled_at: new Date().toISOString(),
                status: 'cancelled'
            })
            .eq('id', subscription.id)
            .select()
            .single();
            
        if (error) throw error;
        
        res.json({
            message: 'Subscription cancelled successfully',
            subscription: data
        });
    } catch (error) {
        console.error('Subscription cancellation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get subscription history
router.get('/history', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
                *,
                plan:subscription_plans(*)
            `)
            .eq('profile_id', req.user.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Subscription history error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
