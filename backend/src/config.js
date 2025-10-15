import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

if (!admin.apps.length) {
  const credential = process.env.FIREBASE_SERVICE_ACCOUNT
    ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
    : admin.credential.applicationDefault();

  admin.initializeApp({
    credential,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (o SUPABASE_SERVICE_KEY) son requeridos');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: { persistSession: false },
  }
);

export const auth = admin.auth();
export const storageBucket = process.env.FIREBASE_STORAGE_BUCKET
  ? admin.storage().bucket(process.env.FIREBASE_STORAGE_BUCKET)
  : null;

export const appConfig = {
  port: process.env.PORT || 8080,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  documentAiProcessorId: process.env.DOCUMENT_AI_PROCESSOR_ID,
  documentAiLocation: process.env.DOCUMENT_AI_LOCATION || 'us',
  projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID,
  overageCostPerPage: Number(process.env.OVERAGE_COST_PER_PAGE || 2.5),
};
