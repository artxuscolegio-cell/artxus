import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Gallery } from '../components/Gallery';
import { UploadModal } from '../components/UploadModal';
import { SettingsPanel } from '../components/SettingsPanel';

export function Home() {
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [titleAnimation, setTitleAnimation] = useState<boolean>(false);

  const { currentUser, isGuest, logout, settings, photos } = useAppStore();

  useEffect(() => {
    setTitleAnimation(true);
  }, []);

  const fontSizeClass =
    settings.fontSize === 'small'
      ? 'text-4xl'
      : settings.fontSize === 'large'
      ? 'text-7xl'
      : 'text-5xl';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${settings.backgroundGradient} transition-all duration-700`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-center md:text-left">
            <h1
              className={`font-black ${fontSizeClass} title-glow transition-all duration-1000 ${
                titleAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
              }`}
            >
              ARTXUS
            </h1>
            <p className="text-slate-700 dark:text-white/60 font-medium text-sm mt-1">
              {isGuest ? 'Modo invitado' : `Bienvenido, ${currentUser?.username}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 rounded-xl transition-all text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white shadow-sm"
              title="Configuración"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-primary/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Subir
            </button>

            <button
              onClick={logout}
              className="p-3 bg-white/40 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-500/30 rounded-xl transition-all text-slate-700 dark:text-white/80 hover:text-red-500 dark:hover:text-red-300 shadow-sm"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-8 bg-white/40 dark:bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/40 dark:border-white/10 max-w-md mx-auto shadow-sm">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{photos.length}</p>
            <p className="text-slate-600 dark:text-white/60 font-medium text-sm">Fotos</p>
          </div>
          <div className="w-px h-12 bg-slate-300 dark:bg-white/20"></div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {photos.reduce((acc, p) => acc + p.likes.length, 0)}
            </p>
            <p className="text-slate-600 dark:text-white/60 font-medium text-sm">Likes</p>
          </div>
        </div>

        {/* Gallery */}
        <Gallery />
      </div>

      {/* Modals */}
      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
