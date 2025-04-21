import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { body, validationResult } from 'express-validator';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Validation middleware
const validateTransaction = [
    body('vehicle_id').isUUID(),
    body('amount').isFloat({ min: 0 }),
    body('transaction_type').isIn(['purchase', 'rental', 'subscription']),
    body('status').isIn(['pending', 'completed', 'cancelled', 'refunded'])
];

// Get all transactions for a user
router.get('/user', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                vehicle:vehicles(*),
                seller:profiles!seller_id(*)
            `)
            .eq('buyer_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                vehicle:vehicles(*),
                buyer:profiles!buyer_id(*),
                seller:profiles!seller_id(*)
            `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        
        // Check if user is buyer or seller
        if (data.buyer_id !== req.user.id && data.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(data);
    } catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new transaction
router.post('/', validateTransaction, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Get vehicle to check seller
        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select('profile_id')
            .eq('id', req.body.vehicle_id)
            .single();

        if (vehicleError) throw vehicleError;

        const transactionData = {
            ...req.body,
            buyer_id: req.user.id,
            seller_id: vehicle.profile_id
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update transaction status
router.put('/:id/status', [
    body('status').isIn(['pending', 'completed', 'cancelled', 'refunded'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if user is seller
        const { data: transaction, error: checkError } = await supabase
            .from('transactions')
            .select('seller_id')
            .eq('id', req.params.id)
            .single();

        if (checkError) throw checkError;

        if (transaction.seller_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the seller can update transaction status' });
        }

        const { data, error } = await supabase
            .from('transactions')
            .update({ status: req.body.status })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get transaction history
router.get('/history/:type', async (req, res) => {
    try {
        const { type } = req.params;
        let query = supabase
            .from('transactions')
            .select(`
                *,
                vehicle:vehicles(*),
                buyer:profiles!buyer_id(*),
                seller:profiles!seller_id(*)
            `);
            
        if (type === 'buying') {
            query = query.eq('buyer_id', req.user.id);
        } else if (type === 'selling') {
            query = query.eq('seller_id', req.user.id);
        } else {
            return res.status(400).json({ error: 'Invalid type parameter. Use "buying" or "selling".' });
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
