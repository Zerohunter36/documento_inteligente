import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { appConfig } from './config.js';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import userRoutes from './routes/users.js';

const app = express();
app.use(cors({ origin: appConfig.clientUrl, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/documents', documentRoutes);
app.use('/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error inesperado', details: err.message });
});

app.listen(appConfig.port, () => {
  console.log(`API escuchando en puerto ${appConfig.port}`);
});
