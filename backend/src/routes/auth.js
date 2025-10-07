import express from 'express';
import { firestore } from '../config.js';
import { authenticate } from '../middleware.js';

const router = express.Router();

router.post('/bootstrap', authenticate, async (req, res) => {
  const { uid, email, displayName } = req.body || {};
  if (!uid || !email) {
    return res.status(400).json({ message: 'uid y email son requeridos' });
  }

  try {
    const userRef = firestore.collection('users').doc(uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      await userRef.set({
        email,
        displayName: displayName || email,
        pageQuota: 1000,
        pagesUsed: 0,
        overagePages: 0,
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({ message: 'Usuario listo' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar usuario', details: error.message });
  }
});

export default router;
