import { useAuth } from '../context/AuthContext';
import { firebaseHelpers, auth } from '../firebase';

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await firebaseHelpers.signOut(auth);
  };

  return (
    <div className="min-h-screen bg-soft">
      <header className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-nubacom.svg" alt="Nubacom" className="h-10" />
            <div>
              <p className="text-sm text-slate-500">Panel de Administración</p>
              <p className="text-lg font-semibold text-accent">Bienvenido, {user?.displayName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-secondary transition"
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
      <footer className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-500 text-center sm:text-left">
          © {new Date().getFullYear()} Nubacom SA de CV, todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
