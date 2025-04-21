import { Router } from 'express';
const router = Router();
import { createClient } from '@supabase/supabase-js';
import { body, validationResult } from 'express-validator';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Validation middleware
const validateVehicle = [
    body('make').notEmpty().trim(),
    body('model').notEmpty().trim(),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('price').isFloat({ min: 0 }),
    body('mileage').isInt({ min: 0 }),
    body('condition').isIn(['new', 'used', 'certified']),
    body('location').notEmpty().trim(),
    body('description').optional().trim()
];

// Get all vehicles
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select(`
                *,
                profile:profiles!vehicles_profile_id_fkey(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select(`
                *,
                profile:profiles!vehicles_profile_id_fkey(*)
            `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new vehicle
router.post('/', validateVehicle, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { data, error } = await supabase
            .from('vehicles')
            .insert({
                ...req.body,
                profile_id: req.user.id
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update vehicle
router.put('/:id', validateVehicle, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { data, error } = await supabase
            .from('vehicles')
            .update(req.body)
            .eq('id', req.params.id)
            .eq('profile_id', req.user.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', req.params.id)
            .eq('profile_id', req.user.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's vehicles
router.get('/user/:userId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('vehicles')
            .select(`
                *,
                profile:profiles!vehicles_profile_id_fkey(*)
            `)
            .eq('profile_id', req.params.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 