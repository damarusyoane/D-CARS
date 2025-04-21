import { Router } from 'express';
const router = Router();
import { createClient } from '@supabase/supabase-js';
import { body, validationResult } from 'express-validator';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Validation middleware
const validateMessage = [
    body('content').notEmpty().trim(),
    body('receiver_id').isUUID(),
    body('vehicle_id').isUUID()
];

// Get all messages for a vehicle
router.get('/vehicle/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:profiles!messages_sender_id_fkey(*),
                receiver:profiles!messages_receiver_id_fkey(*)
            `)
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all conversations for a user
router.get('/conversations', async (req, res) => {
    try {
        const { userId } = req.query;
        const { data, error } = await supabase
            .from('messages')
            .select(`
                id,
                sender_id,
                receiver_id,
                vehicle_id,
                content,
                created_at,
                sender:profiles!messages_sender_id_fkey(*),
                receiver:profiles!messages_receiver_id_fkey(*),
                vehicle:vehicles!messages_vehicle_id_fkey(id, make, model)
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group messages by vehicle_id
        const groupedMessages = data.reduce((acc, msg) => {
            const key = msg.vehicle_id;
            if (!acc[key]) {
                acc[key] = {
                    id: key,
                    sender: msg.sender,
                    receiver: msg.receiver,
                    vehicle: msg.vehicle,
                    last_message: msg
                };
            }
            return acc;
        }, {});

        res.json(Object.values(groupedMessages));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send a new message
router.post('/', async (req, res) => {
    try {
        const { vehicle_id, sender_id, receiver_id, content } = req.body;
        const { data, error } = await supabase
            .from('messages')
            .insert({
                vehicle_id,
                sender_id,
                receiver_id,
                content
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark message as read
router.put('/:messageId/read', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', messageId);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 