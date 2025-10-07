export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary to-secondary">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-6"></div>
        <p className="text-xl font-semibold">Cargando portal NEXTRACT...</p>
      </div>
    </div>
  );
}
