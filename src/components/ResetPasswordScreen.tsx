import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppStore } from '../store/useAppStore';

export function ResetPasswordScreen({ userId, secret, onComplete }: { userId: string, secret: string, onComplete: () => void }) {
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { updatePasswordRecovery } = useAppStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== passwordAgain) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const ok = await updatePasswordRecovery(userId, secret, password);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    } else {
      setError('Hubo un error al actualizar la contraseña. El enlace puede ser inválido o haber expirado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-pastel-violet dark:bg-none dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#312e81] dark:bg-gradient-to-br">
      <div className="glass-card animate-in rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black title-glow">Restablecer Contraseña</h1>
        </div>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400 font-medium mb-4">¡Contraseña actualizada con éxito!</p>
            <p className="text-slate-600 dark:text-white/70 text-sm">Serás redirigido al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-2">Nueva Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={passwordAgain}
                onChange={(e) => setPasswordAgain(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-500 dark:text-red-400 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-primary/50 mt-2"
            >
              Actualizar Contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
