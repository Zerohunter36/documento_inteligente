import { useRef, useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function UploadCard({ onUpload }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-soft mb-6">
        <CloudArrowUpIcon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-accent mb-2">Sube tu documento</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Arrastra y suelta archivos PDF, JPG o PNG de hasta 25 MB. Cada documento descontará una hoja de tu saldo.
      </p>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium shadow hover:shadow-lg transition disabled:opacity-50"
      >
        {uploading ? 'Procesando...' : 'Seleccionar archivo'}
      </button>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        ref={fileRef}
        onChange={handleFileChange}
        hidden
      />
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
}
