import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Gallery } from '../components/Gallery';
import { UploadModal } from '../components/UploadModal';
import { SettingsPanel } from '../components/SettingsPanel';
import { AdminInbox } from '../components/AdminInbox';

export function Home() {
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showInbox, setShowInbox] = useState<boolean>(false);
  const [titleAnimation, setTitleAnimation] = useState<boolean>(false);

  const { currentUser, isGuest, logout, settings, photos, loginNotifications } = useAppStore();

  useEffect(() => {
    setTitleAnimation(true);
  }, []);

  const fontSizeClass =
    settings.fontSize === 'small'
      ? 'text-4xl'
      : settings.fontSize === 'large'
      ? 'text-7xl'
      : 'text-5xl';

  const isLight = settings.theme === 'light' || (settings.theme === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Map dark gradients to pastel equivalents for light mode
  const pastelMap: Record<string, string> = {
    'from-violet-600 via-indigo-600 to-purple-700': 'bg-pastel-violet',
    'from-blue-600 via-cyan-600 to-teal-700':       'bg-pastel-blue',
    'from-pink-600 via-rose-600 to-red-700':         'bg-pastel-pink',
    'from-green-600 via-emerald-600 to-teal-700':    'bg-pastel-green',
    'from-orange-600 via-amber-600 to-yellow-700':   'bg-pastel-orange',
    'from-slate-700 via-gray-600 to-slate-800':      'bg-pastel-slate',
    'from-red-500 via-yellow-500 to-green-500':      'bg-pastel-rainbow',
    'from-orange-500 via-pink-500 to-purple-600':    'bg-pastel-sunset',
  };

  const backgroundClass = isLight
    ? (pastelMap[settings.backgroundGradient] ?? 'bg-pastel-violet')
    : `bg-gradient-to-br ${settings.backgroundGradient}`;

  return (
    <div className={`min-h-screen ${backgroundClass} transition-all duration-700`}>
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
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setShowInbox(true)}
                className="p-3 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 rounded-xl transition-all text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white shadow-sm relative"
                title="Bandeja de Entrada"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {loginNotifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {loginNotifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            )}

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

        {/* Pinned Photos (Liquid Glass Effect) */}
        {photos.filter(p => p.pinned).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 px-2">Mejores Dibujos</h2>
            <div className="bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/40 dark:border-white/20 shadow-2xl rounded-3xl p-4 overflow-x-auto flex gap-4 custom-scrollbar">
              {photos.filter(p => p.pinned).map(photo => (
                <div key={`pinned-${photo.id}`} className="flex-none w-48 relative group">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/30 dark:border-white/10">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.description || 'Dibujo fijado'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-end p-3 pointer-events-none">
                    <p className="text-white text-sm font-medium truncate">@{photo.username}</p>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => useAppStore.getState().togglePinPhoto(photo.id)}
                      className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-full shadow-sm md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all z-10"
                      title="Desfijar foto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        <Gallery />
      </div>

      {/* Modals */}
      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {/* Inbox Modal */}
      {showInbox && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowInbox(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AdminInbox />
          </div>
        </div>
      )}
    </div>
  );
}
