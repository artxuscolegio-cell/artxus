import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { AppState } from '../store/useAppStore';
import { CursorSparkles } from './CursorSparkles';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showGuestInfo, setShowGuestInfo] = useState<boolean>(false);

  const { login, register, loginAsGuest, setAuthMode } = useAppStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = await login(email, password);
      if (!success) {
        setError('Email o contraseña incorrectos');
      }
    } else {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setError('Todos los campos son requeridos');
        return;
      }
      const success = await register(username, email, password);
      if (!success) {
        setError('El email ya está registrado');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-pastel-violet dark:bg-none dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#312e81] dark:bg-gradient-to-br">
      <CursorSparkles />
      <div className="glass-card animate-in rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black title-glow">
            ARTXUS
          </h1>
          <p className="text-slate-600 dark:text-white/70 mt-2 font-medium">
            {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                placeholder="Tu nombre"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/60 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              placeholder="correo@colegio.edu"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/60 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-primary/50 mt-2"
          >
            {isLogin ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setShowGuestInfo(true)}
            className="w-full py-3 bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-medium rounded-xl hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
          >
            Continuar como invitado
          </button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-slate-300 dark:bg-white/20"></div>
            <span className="text-slate-500 dark:text-white/50 text-sm font-medium">o</span>
            <div className="flex-1 h-px bg-slate-300 dark:bg-white/20"></div>
          </div>

          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="w-full text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        {/* Volver al código de acceso */}
        <button
          onClick={() => setAuthMode('access')}
          className="mt-4 w-full text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60 text-xs font-medium transition-colors"
        >
          ← Volver
        </button>
      </div>

      {/* Guest Info Modal */}
      {showGuestInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card animate-in-fast rounded-2xl p-6 bg-white dark:bg-slate-900 max-w-md w-full border border-slate-200 dark:border-white/10 relative">
            <button
              onClick={() => setShowGuestInfo(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Advertencia: Modo Invitado</h3>
            
            <div className="text-sm text-slate-600 dark:text-white/70 space-y-3">
              <p>
                Al entrar como invitado, utilizarás una **cuenta compartida** por todos los usuarios que eligen esta opción.
              </p>
              <p>
                Ten en cuenta que:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Las fotos que subas podrán ser vistas por cualquier otra persona que entre como invitado.</li>
                <li>Cualquier invitado puede eliminar las fotos subidas en este modo en cualquier momento.</li>
                <li>No tendrás un perfil personalizado ni historial propio.</li>
              </ul>
              <p>
                Te recomendamos **crear una cuenta propia** si deseas tener privacidad y un control total sobre tus fotos.
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGuestInfo(false)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-white/20 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowGuestInfo(false);
                  loginAsGuest();
                }}
                className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all text-sm shadow-md hover:shadow-primary/30"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
