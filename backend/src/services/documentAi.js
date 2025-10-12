import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { appConfig } from '../config.js';

let client;

export async function processDocument(buffer, mimeType, fileName) {
  if (!appConfig.documentAiProcessorId) {
    // Fallback stub when Document AI is not configured
    return {
      pagesUsed: 1,
      fields: [
        { label: 'Archivo', value: fileName },
        { label: 'Mensaje', value: 'Document AI no configurado - datos de prueba' },
      ],
    };
  }

  if (!client) {
    client = new DocumentProcessorServiceClient();
  }

  const request = {
    name: client.processorPath(
      appConfig.projectId,
      appConfig.documentAiLocation,
      appConfig.documentAiProcessorId
    ),
    rawDocument: {
      content: buffer,
      mimeType,
    },
  };

  const [result] = await client.processDocument(request);
  const { document } = result;
  const pagesUsed = document?.pages?.length || 1;
  const fields = (document?.entities || []).map((entity) => ({
    label: entity.type || entity.mentionText || 'Campo',
    value: entity.mentionText || '',
    confidence: entity.confidence,
  }));

  return { pagesUsed, fields };
}
