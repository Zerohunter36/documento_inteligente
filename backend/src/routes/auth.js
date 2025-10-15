import express from 'express';
import { supabase } from '../config.js';
import { authenticate } from '../middleware.js';

const router = express.Router();

router.post('/bootstrap', authenticate, async (req, res) => {
  const { uid, email, displayName } = req.body || {};
  if (!uid || !email) {
    return res.status(400).json({ message: 'uid y email son requeridos' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', uid)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      const { error: insertError } = await supabase.from('users').insert({
        id: uid,
        email,
        display_name: displayName || email,
        page_quota: 1000,
        pages_used: 0,
        overage_pages: 0,
        overage_cost: 0,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        throw insertError;
      }
    }

    return res.json({ message: 'Usuario listo' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar usuario', details: error.message });
  }
});

export default router;
