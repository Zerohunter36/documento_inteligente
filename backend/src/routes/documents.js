import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabase, storageBucket, appConfig } from '../config.js';
import { authenticate } from '../middleware.js';
import { processDocument } from '../services/documentAi.js';
import { generateExcel } from '../services/excel.js';
import { calculateCreditsUsage } from '../utils/credits.js';

const router = express.Router();
const templatesDir = path.resolve(process.cwd(), 'public', 'plantillas');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

function mapUserRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    email: record.email,
    displayName: record.display_name,
    pageQuota: record.page_quota || 0,
    pagesUsed: record.pages_used || 0,
    overagePages: record.overage_pages || 0,
    overageCost: record.overage_cost || 0,
    createdAt: record.created_at,
  };
}

function mapDocumentRecord(record) {
  return {
    id: record.id,
    documentId: record.id,
    originalFileName: record.original_file_name,
    mimeType: record.mime_type,
    pagesUsed: record.pages_used,
    excelFilePath: record.excel_file_path,
    storagePath: record.storage_path,
    excelBase64: record.excel_base64,
    fields: record.fields,
    createdAt: record.created_at,
    status: record.status,
  };
}

router.get('/', authenticate, async (req, res) => {
  try {
    const { data: documentRows, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', req.user.uid)
      .order('created_at', { ascending: false })
      .limit(50);

    if (documentsError) {
      throw documentsError;
    }

    const documents = (documentRows || []).map(mapDocumentRecord);

    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.uid)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    const userData = mapUserRecord(userRow) || {};

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
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.uid)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    let userData = mapUserRecord(existingUser);

    if (!userData) {
      const defaultUser = {
        id: req.user.uid,
        email: req.user.email || null,
        display_name: req.user.name || req.user.email || req.user.uid,
        page_quota: 1000,
        pages_used: 0,
        overage_pages: 0,
        overage_cost: 0,
        created_at: new Date().toISOString(),
      };

      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert(defaultUser)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      userData = mapUserRecord(insertedUser);
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
    const inlineExcelBase64 = Buffer.from(excelBuffer).toString('base64');

    const documentId = uuidv4();
    const originalFileName = `${req.user.uid}/${documentId}/${originalname}`;
    const excelFileName = `${req.user.uid}/${documentId}/resultado.xlsx`;

    if (storageBucket) {
      await storageBucket.file(originalFileName).save(buffer, { contentType: mimetype });
      await storageBucket.file(excelFileName).save(Buffer.from(excelBuffer), {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    }

    const credits = calculateCreditsUsage(userData, pagesUsed, appConfig.overageCostPerPage);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        pages_used: credits.newTotal,
        overage_pages: credits.overagePages,
        overage_cost: credits.overageCost,
      })
      .eq('id', req.user.uid);

    if (updateError) {
      throw updateError;
    }

    const documentRecord = {
      id: documentId,
      user_id: req.user.uid,
      original_file_name: originalname,
      mime_type: mimetype,
      pages_used: pagesUsed,
      excel_file_path: storageBucket ? excelFileName : null,
      storage_path: storageBucket ? originalFileName : null,
      excel_base64: storageBucket ? null : inlineExcelBase64,
      fields,
      created_at: new Date().toISOString(),
      status: 'procesado',
    };

    const { error: insertDocError } = await supabase.from('documents').insert(documentRecord);

    if (insertDocError) {
      throw insertDocError;
    }

    return res.json({
      message: 'Documento procesado',
      document: mapDocumentRecord(documentRecord),
      stats: {
        quota: credits.quota,
        used: credits.newTotal,
        overagePages: credits.overagePages,
        overageCost: credits.overageCost,
      },
      downloadUrl: storageBucket ? `/documents/${documentId}/excel` : null,
      excelBase64: storageBucket ? undefined : inlineExcelBase64,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudo procesar el documento', details: error.message });
  }
});

router.get('/:documentId/excel', authenticate, async (req, res) => {
  try {
    const { documentId } = req.params;
    const { data: docRow, error } = await supabase
      .from('documents')
      .select('excel_file_path')
      .eq('id', documentId)
      .eq('user_id', req.user.uid)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!docRow) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    const { excel_file_path: excelFilePath } = docRow;

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
