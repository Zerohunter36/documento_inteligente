import express from 'express';
import { supabase } from '../config.js';
import { authenticate } from '../middleware.js';

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.uid)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      pageQuota: data.page_quota || 0,
      pagesUsed: data.pages_used || 0,
      overagePages: data.overage_pages || 0,
      overageCost: data.overage_cost || 0,
      createdAt: data.created_at,
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener el usuario', details: error.message });
  }
});

router.post('/quota', authenticate, async (req, res) => {
  const { pageQuota } = req.body || {};
  if (typeof pageQuota !== 'number') {
    return res.status(400).json({ message: 'pageQuota debe ser numérico' });
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ page_quota: pageQuota })
      .eq('id', req.user.uid);

    if (error) {
      throw error;
    }

    return res.json({ message: 'Cuota actualizada', pageQuota });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar la cuota', details: error.message });
  }
});

export default router;
