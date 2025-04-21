import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { body, validationResult } from 'express-validator';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get user's favorite vehicles
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                *,
                vehicle:vehicles(*)
            `)
            .eq('profile_id', req.user.id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add vehicle to favorites
router.post('/', [
    body('vehicle_id').isUUID()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if already favorited
        const { data: existingFav, error: checkError } = await supabase
            .from('favorites')
            .select('id')
            .eq('profile_id', req.user.id)
            .eq('vehicle_id', req.body.vehicle_id)
            .maybeSingle();

        if (checkError) throw checkError;

        // If already favorited, return existing
        if (existingFav) {
            return res.status(200).json({ 
                message: 'Vehicle already in favorites',
                id: existingFav.id 
            });
        }

        // Add to favorites
        const { data, error } = await supabase
            .from('favorites')
            .insert({
                profile_id: req.user.id,
                vehicle_id: req.body.vehicle_id
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove vehicle from favorites
router.delete('/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('profile_id', req.user.id)
            .eq('vehicle_id', vehicleId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error('Remove favorite error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check if a vehicle is in user's favorites
router.get('/check/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        
        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('profile_id', req.user.id)
            .eq('vehicle_id', vehicleId)
            .maybeSingle();

        if (error) throw error;
        
        res.json({ 
            isFavorite: !!data,
            favoriteId: data?.id
        });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
