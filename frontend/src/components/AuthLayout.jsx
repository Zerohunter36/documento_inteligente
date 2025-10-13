import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soft via-white to-soft flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white/90 backdrop-blur shadow-2xl rounded-3xl overflow-hidden border border-slate-100">
        <div className="relative p-12 bg-slate-900 text-white flex flex-col justify-between">
          <div className="absolute inset-0 opacity-80" style={{
            background: 'radial-gradient(circle at top left, rgba(240,90,40,0.45), transparent 55%), radial-gradient(circle at bottom right, rgba(10,22,40,0.75), transparent 45%)'
          }} />
          <div className="relative z-10 flex flex-col gap-8">
            <img src="/logo-nubacom.svg" alt="Nubacom" className="h-14 w-auto" />
            <div>
              <h2 className="text-4xl font-bold leading-tight">Portal inteligente Nubacom</h2>
              <p className="mt-4 text-lg text-slate-200">
                Centraliza tus procesos Document AI y mantén control total de tus hojas disponibles con herramientas intuitivas.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-200/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                <span>Autenticación segura con seguimiento de usuarios y paquetes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                <span>Historial consolidado de documentos procesados y resultados descargables.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                <span>Integración directa con Google Document AI y almacenamiento seguro.</span>
              </li>
            </ul>
          </div>
          <div className="relative z-10 text-sm text-slate-200/80">
            © {new Date().getFullYear()} Nubacom Sa de CV, todos los derechos reservados.
          </div>
        </div>
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-accent mb-2">{title}</h1>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          <div className="space-y-8">
            {children}
          </div>
          <div className="mt-10 text-sm text-gray-500 flex justify-between">
            <Link to="/login" className="hover:text-primary transition">Iniciar sesión</Link>
            <Link to="/register" className="hover:text-primary transition">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
