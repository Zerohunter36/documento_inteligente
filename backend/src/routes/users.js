import express from 'express';
import { firestore } from '../config.js';
import { authenticate } from '../middleware.js';

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    const snapshot = await firestore.collection('users').doc(req.user.uid).get();
    if (!snapshot.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    return res.json(snapshot.data());
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
    await firestore.collection('users').doc(req.user.uid).set({ pageQuota }, { merge: true });
    return res.json({ message: 'Cuota actualizada', pageQuota });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar la cuota', details: error.message });
  }
});

export default router;
