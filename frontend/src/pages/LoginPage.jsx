import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';
import { auth, firebaseHelpers } from '../firebase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const credentials = await firebaseHelpers.signInWithEmailAndPassword(auth, email, password);
      const token = await credentials.user.getIdToken();
      await axios.post('auth/bootstrap', {
        uid: credentials.user.uid,
        email: credentials.user.email,
        displayName: credentials.user.displayName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Inicia sesión"
      subtitle="Accede a tu panel de control y gestiona tus hojas disponibles"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-semibold hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </AuthLayout>
  );
}
