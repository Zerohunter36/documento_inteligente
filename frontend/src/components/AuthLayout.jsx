import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-soft flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-b from-primary to-secondary text-white p-10 flex flex-col justify-between">
          <div>
            <img src="/logo-nextract.svg" alt="NEXTRACT" className="h-12 mb-8" />
            <h2 className="text-3xl font-bold mb-4">Mx Mart NEXTRACT</h2>
            <p className="text-lg opacity-90">
              Automatiza la captura de datos y controla tus hojas disponibles con un panel moderno.
            </p>
          </div>
          <div className="text-sm opacity-80">© {new Date().getFullYear()} Mx Mart de México S.A. de C.V.</div>
        </div>
        <div className="p-10">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-accent mb-2">{title}</h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          {children}
          <div className="mt-10 text-sm text-gray-500 flex justify-between">
            <Link to="/login" className="hover:text-primary transition">Iniciar sesión</Link>
            <Link to="/register" className="hover:text-primary transition">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
