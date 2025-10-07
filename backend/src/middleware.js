import { auth } from './config.js';

export async function authenticate(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.replace('Bearer ', '')
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido', details: error.message });
  }
}
