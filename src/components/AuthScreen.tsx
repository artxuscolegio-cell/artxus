import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CursorSparkles } from './CursorSparkles';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showGuestInfo, setShowGuestInfo] = useState<boolean>(false);
  
  // Recovery state
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetStep, setResetStep] = useState<'input_email' | 'direct_reset' | 'completed'>('input_email');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [resetStatus, setResetStatus] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);

  const { login, register, loginAsGuest, setAuthMode, resetPassword, resetPasswordDirect } = useAppStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setError('Ingresa tu correo y contraseña');
        return;
      }
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Correo o contraseña incorrectos');
      }
    } else {
      if (!username.trim() || !email.trim() || !password.trim()) {
        setError('Todos los campos son requeridos');
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      const res = await register(username, email, password);
      if (!res.success) {
        setError(res.error || 'No se pudo crear la cuenta');
      }
    }
  };

  const handlePasswordResetRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    
    setResetStatus(null);
    const res = await resetPassword(resetEmail);
    
    if (res.success) {
      if (res.type === 'local' && res.code) {
        setGeneratedCode(res.code);
        setResetStep('direct_reset');
        setResetStatus({
          type: 'info',
          message: `Código de recuperación: ${res.code}. Ingresa tu nueva contraseña para actualizarla.`
        });
      } else {
        setResetStatus({
          type: 'success',
          message: res.message || 'Te hemos enviado un correo con las instrucciones.'
        });
        setTimeout(() => {
          closeForgotPasswordModal();
        }, 4000);
      }
    } else {
      setResetStatus({
        type: 'error',
        message: res.error || 'No se encontró una cuenta con este correo.'
      });
    }
  };

  const handleDirectPasswordReset = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      setResetStatus({ type: 'error', message: 'Las contraseñas no coinciden' });
      return;
    }
    if (newPassword.length < 6) {
      setResetStatus({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const res = resetPasswordDirect(resetEmail, newPassword);
    if (res.success) {
      setResetStatus({
        type: 'success',
        message: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.'
      });
      setResetStep('completed');
      setTimeout(() => {
        closeForgotPasswordModal();
        setIsLogin(true);
        setEmail(resetEmail);
        setPassword(newPassword);
      }, 2500);
    } else {
      setResetStatus({
        type: 'error',
        message: res.error || 'Error al actualizar la contraseña'
      });
    }
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetStep('input_email');
    setResetEmail('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setGeneratedCode('');
    setResetStatus(null);
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
            {isLogin && (
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card animate-in-fast rounded-2xl p-6 bg-white dark:bg-slate-900 max-w-md w-full border border-slate-200 dark:border-white/10 relative">
            <button
              onClick={closeForgotPasswordModal}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Recuperar Contraseña</h3>
            
            {resetStep === 'input_email' && (
              <>
                <p className="text-sm text-slate-600 dark:text-white/70 mb-4">
                  Ingresa tu correo electrónico y enviaremos un código/enlace para restablecer tu contraseña.
                </p>
                
                <form onSubmit={handlePasswordResetRequest}>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm mb-4"
                    placeholder="tu@correo.com"
                    required
                  />
                  
                  {resetStatus && (
                    <p className={`text-sm text-center mb-4 font-medium ${resetStatus.type === 'success' ? 'text-green-500 dark:text-green-400' : resetStatus.type === 'info' ? 'text-blue-500 dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>
                      {resetStatus.message}
                    </p>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="flex-1 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-white/20 transition-all text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all text-sm shadow-md hover:shadow-primary/30"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </>
            )}

            {resetStep === 'direct_reset' && (
              <>
                <p className="text-sm text-slate-600 dark:text-white/70 mb-2">
                  Actualizando contraseña para: <span className="font-semibold text-slate-800 dark:text-white">{resetEmail}</span>
                </p>
                {generatedCode && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 text-center">
                    <span className="text-xs text-slate-500 dark:text-white/60 block">Código de verificación</span>
                    <span className="text-2xl font-mono font-bold text-primary tracking-widest">{generatedCode}</span>
                  </div>
                )}
                
                <form onSubmit={handleDirectPasswordReset} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-white/80 mb-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-white/80 mb-1">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Repite la contraseña"
                      required
                    />
                  </div>

                  {resetStatus && (
                    <p className={`text-sm text-center font-medium ${resetStatus.type === 'success' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                      {resetStatus.message}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="flex-1 py-2.5 bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white font-semibold rounded-xl text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl text-sm shadow-md hover:bg-primary/90"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              </>
            )}

            {resetStep === 'completed' && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">¡Contraseña Actualizada!</h4>
                <p className="text-sm text-slate-600 dark:text-white/70">
                  {resetStatus?.message || 'Ya puedes iniciar sesión con tu nueva contraseña.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
