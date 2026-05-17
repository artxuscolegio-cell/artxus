import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { AppState } from '../store/useAppStore';
import { CursorSparkles } from './CursorSparkles';

export function AccessScreen() {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const setAccessCode = useAppStore((s: AppState) => s.setAccessCode);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code.trim() === 'ARTXUS2026') {
      setAccessCode(code);
    } else {
      setError('Código de acceso inválido');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#0f172a] dark:via-[#1e1b4b] dark:to-[#312e81]">
      <CursorSparkles />
      <div className="glass-card animate-in rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black title-glow animate-pulse">
            ARTXUS
          </h1>
          <p className="text-slate-600 dark:text-white/70 mt-2 font-medium">Galería del Colegio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-2">
              Código de Acceso
            </label>
            <input
              type="password"
              value={code}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
              className="w-full px-4 py-3 bg-white/60 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              placeholder="Ingresa el código"
            />
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-primary/50"
          >
            Entrar
          </button>
        </form>

        <p className="text-slate-500 dark:text-white/50 text-center text-xs mt-6 font-medium">
          Solo para miembros del colegio
        </p>
      </div>
    </div>
  );
}
