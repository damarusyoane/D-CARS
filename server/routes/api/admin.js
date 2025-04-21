import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { body, validationResult } from 'express-validator';
import 'dotenv/config';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Admin middleware to check for admin role
const adminCheck = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();
        
        if (error) throw error;
        
        if (data?.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
        }
        
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all users (admin only)
router.get('/users', adminCheck, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get admin dashboard stats
router.get('/dashboard', adminCheck, async (req, res) => {
    try {
        // Get vehicle count
        const { count: vehicleCount, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true });
        
        if (vehicleError) throw vehicleError;
        
        // Get user count
        const { count: userCount, error: userError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        // Get transactions count
        const { count: transactionCount, error: transactionError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true });
        
        if (transactionError) throw transactionError;
        
        // Get recent vehicles
        const { data: recentVehicles, error: recentError } = await supabase
            .from('vehicles')
            .select(`
                *,
                profile:profiles!vehicles_profile_id_fkey(*)
            `)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (recentError) throw recentError;
        
        res.json({
            stats: {
                vehicleCount,
                userCount,
                transactionCount
            },
            recentVehicles
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user (admin only)
router.put('/users/:userId', adminCheck, [
    body('role').optional().isIn(['user', 'admin']),
    body('status').optional().isIn(['active', 'suspended']),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { userId } = req.params;
        const { data, error } = await supabase
            .from('profiles')
            .update(req.body)
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
