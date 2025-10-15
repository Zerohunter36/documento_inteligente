import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: axios.defaults.baseURL });

api.interceptors.request.use((config) => {
  const token = axios.defaults.headers.common.Authorization;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('documents');
      setStats(data.stats);
      setDocuments(data.documents);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(
    async (file, templatePath) => {
      const formData = new FormData();
      formData.append('file', file);
      if (templatePath) {
        formData.append('templatePath', templatePath);
      }
      const { data } = await api.post('documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchData();
      return data;
    },
    [fetchData]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, documents, loading, error, uploadFile, refresh: fetchData };
}
