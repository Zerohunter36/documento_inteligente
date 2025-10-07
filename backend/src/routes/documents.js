import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { firestore, storageBucket, appConfig } from '../config.js';
import { authenticate } from '../middleware.js';
import { processDocument } from '../services/documentAi.js';
import { generateExcel } from '../services/excel.js';
import { calculateCreditsUsage } from '../utils/credits.js';

const router = express.Router();
const templatesDir = path.resolve(process.cwd(), 'public', 'plantillas');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.get('/', authenticate, async (req, res) => {
  try {
    const docsSnapshot = await firestore
      .collection('users')
      .doc(req.user.uid)
      .collection('documents')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const documents = docsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const userSnapshot = await firestore.collection('users').doc(req.user.uid).get();
    const userData = userSnapshot.data() || {};

    return res.json({
      documents,
      stats: {
        quota: userData.pageQuota || 0,
        used: userData.pagesUsed || 0,
        overagePages: userData.overagePages || 0,
        overageCost: userData.overageCost || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener el historial', details: error.message });
  }
});

router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Archivo requerido' });
  }

  try {
    const { buffer, mimetype, originalname } = req.file;
    const { templatePath } = req.body;
    const userRef = firestore.collection('users').doc(req.user.uid);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        pageQuota: 1000,
        pagesUsed: 0,
        overagePages: 0,
        overageCost: 0,
        createdAt: new Date().toISOString(),
      });
      userDoc = await userRef.get();
    }

    let resolvedTemplate;
    if (templatePath) {
      const candidate = path.resolve(templatesDir, templatePath);
      if (!candidate.startsWith(templatesDir)) {
        return res.status(400).json({ message: 'Plantilla inválida' });
      }
      if (!fs.existsSync(candidate)) {
        return res.status(404).json({ message: 'Plantilla no encontrada' });
      }
      resolvedTemplate = candidate;
    }

    const { pagesUsed, fields } = await processDocument(buffer, mimetype, originalname);
    const excelBuffer = await generateExcel(fields, resolvedTemplate);

    const documentId = uuidv4();
    const originalFileName = `${req.user.uid}/${documentId}/${originalname}`;
    const excelFileName = `${req.user.uid}/${documentId}/resultado.xlsx`;

    if (storageBucket) {
      await storageBucket.file(originalFileName).save(buffer, { contentType: mimetype });
      await storageBucket.file(excelFileName).save(Buffer.from(excelBuffer), {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }

    const credits = calculateCreditsUsage(userDoc, pagesUsed, appConfig.overageCostPerPage);

    await userRef.set(
      {
        pagesUsed: credits.newTotal,
        overagePages: credits.overagePages,
        overageCost: credits.overageCost,
      },
      { merge: true }
    );

    const documentData = {
      originalFileName: originalname,
      documentId,
      mimeType: mimetype,
      pagesUsed,
      excelFilePath: storageBucket ? excelFileName : null,
      storagePath: storageBucket ? originalFileName : null,
      excelBase64: storageBucket ? null : Buffer.from(excelBuffer).toString('base64'),
      fields,
      createdAt: new Date().toISOString(),
      status: 'procesado',
    };

    await userRef.collection('documents').doc(documentId).set(documentData);

    return res.json({
      message: 'Documento procesado',
      document: documentData,
      stats: {
        quota: credits.quota,
        used: credits.newTotal,
        overagePages: credits.overagePages,
        overageCost: credits.overageCost,
      },
      downloadUrl: storageBucket ? `/documents/${documentId}/excel` : null,
      excelBase64: storageBucket ? undefined : Buffer.from(excelBuffer).toString('base64'),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo procesar el documento', details: error.message });
  }
});

router.get('/:documentId/excel', authenticate, async (req, res) => {
  try {
    const { documentId } = req.params;
    const docSnapshot = await firestore
      .collection('users')
      .doc(req.user.uid)
      .collection('documents')
      .doc(documentId)
      .get();

    if (!docSnapshot.exists) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    const { excelFilePath } = docSnapshot.data();

    if (!storageBucket || !excelFilePath) {
      return res.status(400).json({ message: 'El almacenamiento no está configurado' });
    }

    const file = storageBucket.file(excelFilePath);
    const [exists] = await file.exists();

    if (!exists) {
      return res.status(404).json({ message: 'Archivo no disponible' });
    }

    const stream = file.createReadStream();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="resultado.xlsx"');
    stream.pipe(res);
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo descargar el Excel', details: error.message });
  }
});

export default router;
