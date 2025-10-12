const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

function downloadBase64(doc) {
  const link = document.createElement('a');
  link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${doc.excelBase64}`;
  link.download = `${doc.documentId || 'resultado'}.xlsx`;
  link.click();
}

export default function DocumentsTable({ documents }) {
  if (!documents?.length) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-8 text-center text-gray-500">
        No has procesado documentos aún. ¡Sube tu primer archivo para comenzar!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-soft">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Archivo
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Hojas
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Resultado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-accent">{doc.originalFileName}</div>
                <div className="text-xs text-gray-500">{doc.mimeType}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(doc.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.pagesUsed}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-700">
                  {doc.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {doc.excelFilePath || doc.excelBase64 ? (
                  <button
                    onClick={() =>
                      doc.excelBase64
                        ? downloadBase64(doc)
                        : window.open(`${apiBase}/documents/${doc.id}/excel`, '_blank')
                    }
                    className="px-4 py-2 bg-primary text-white rounded-full text-xs font-semibold hover:bg-secondary transition"
                  >
                    Descargar
                  </button>
                ) : (
                  <span className="text-gray-400">No disponible</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
