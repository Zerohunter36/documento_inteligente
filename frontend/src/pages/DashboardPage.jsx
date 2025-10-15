import { useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatsCards from '../components/StatsCards';
import UploadCard from '../components/UploadCard';
import DocumentsTable from '../components/DocumentsTable';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { stats, documents, loading, error, uploadFile } = useDashboard();
  const usagePercent = useMemo(() => {
    if (!stats?.quota) return 0;
    return Math.min(100, Math.round(((stats.used || 0) / stats.quota) * 100));
  }, [stats]);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-8">
          <StatsCards stats={stats} />
          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h2 className="text-xl font-semibold text-accent mb-4">Uso de servicio</h2>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831"
                  />
                  <path
                    className="text-primary"
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    strokeDasharray={`${usagePercent}, 100`}
                    d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">{usagePercent}%</span>
                </div>
              </div>
              <div>
                <p className="text-gray-500">Hojas analizadas</p>
                <p className="text-3xl font-bold text-accent">
                  {stats?.used ?? 0}
                  <span className="text-base text-gray-500 ml-2">de {stats?.quota ?? 0}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <UploadCard onUpload={uploadFile} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-6 py-4 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center text-gray-500">
          Cargando historial de documentos...
        </div>
      ) : (
        <DocumentsTable documents={documents} />
      )}
    </DashboardLayout>
  );
}
