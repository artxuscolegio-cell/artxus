import { useState } from 'react';
import type { AppState } from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';

const gradientOptions = [
  { id: 'violet', value: 'from-violet-600 via-indigo-600 to-purple-700', label: 'Violeta' },
  { id: 'blue', value: 'from-blue-600 via-cyan-600 to-teal-700', label: 'Azul' },
  { id: 'pink', value: 'from-pink-600 via-rose-600 to-red-700', label: 'Rosa' },
  { id: 'green', value: 'from-green-600 via-emerald-600 to-teal-700', label: 'Verde' },
  { id: 'orange', value: 'from-orange-600 via-amber-600 to-yellow-700', label: 'Naranja' },
  { id: 'slate', value: 'from-slate-700 via-gray-600 to-slate-800', label: 'Gris' },
  { id: 'rainbow', value: 'from-red-500 via-yellow-500 to-green-500', label: 'Arcoíris' },
  { id: 'sunset', value: 'from-orange-500 via-pink-500 to-purple-600', label: 'Atardecer' },
  { id: 'ocean', value: 'from-cyan-500 via-blue-500 to-indigo-600', label: 'Océano' },
  { id: 'forest', value: 'from-emerald-500 via-green-600 to-teal-700', label: 'Bosque' },
  { id: 'berry', value: 'from-fuchsia-600 via-purple-600 to-pink-600', label: 'Frutos Rojos' },
  { id: 'midnight', value: 'from-blue-900 via-indigo-900 to-slate-900', label: 'Medianoche' },
  { id: 'peach', value: 'from-red-400 via-orange-400 to-yellow-400', label: 'Melocotón' },
  { id: 'cyberpunk', value: 'from-yellow-400 via-pink-500 to-purple-600', label: 'Cyberpunk' },
  { id: 'aurora', value: 'from-green-400 via-cyan-500 to-blue-500', label: 'Aurora' },
  { id: 'lavender', value: 'from-indigo-300 via-purple-400 to-pink-300', label: 'Lavanda' },
];

const colorOptions = [
  { id: 'violet', value: '#8b5cf6', label: 'Violeta' },
  { id: 'blue', value: '#3b82f6', label: 'Azul' },
  { id: 'pink', value: '#ec4899', label: 'Rosa' },
  { id: 'green', value: '#22c55e', label: 'Verde' },
  { id: 'orange', value: '#f97316', label: 'Naranja' },
  { id: 'red', value: '#ef4444', label: 'Rojo' },
  { id: 'cyan', value: '#06b6d4', label: 'Cian' },
  { id: 'amber', value: '#f59e0b', label: 'Ámbar' },
  { id: 'emerald', value: '#10b981', label: 'Esmeralda' },
  { id: 'teal', value: '#14b8a6', label: 'Verde azulado' },
  { id: 'indigo', value: '#6366f1', label: 'Índigo' },
  { id: 'fuchsia', value: '#d946ef', label: 'Fucsia' },
  { id: 'rose', value: '#f43f5e', label: 'Rojo rosa' },
  { id: 'yellow', value: '#eab308', label: 'Amarillo' },
  { id: 'sky', value: '#0ea5e9', label: 'Celeste' },
  { id: 'slate', value: '#64748b', label: 'Pizarra' },
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings, currentUser, photos, deleteAllPhotos, loginNotifications, clearAllNotifications, markNotificationRead } = useAppStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'gallery' | 'privacy' | 'admin'>('appearance');
  const isAdmin = currentUser?.role === 'admin';

  if (!isOpen) return null;

  const tabs = [
    { id: 'appearance', label: 'Apariencia', icon: '🎨' },
    { id: 'gallery', label: 'Galería', icon: '🖼️' },
    { id: 'privacy', label: 'Privacidad', icon: '🔒' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }] : []),
  ];

  const unreadNotifications = loginNotifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg h-full overflow-y-auto border-l border-slate-200 dark:border-white/10 shadow-2xl transition-colors">
        <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4 flex items-center justify-between z-10 transition-colors">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-slate-200 dark:border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-6">
          {activeTab === 'appearance' && (
            <>
              <div>
                <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-3">Tema</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'auto'] as const).map(theme => (
                    <button
                      key={theme}
                      onClick={() => updateSettings({ theme })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        settings.theme === theme
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20'
                      }`}
                    >
                      {theme === 'light' ? '☀️ Claro' : theme === 'dark' ? '🌙 Oscuro' : '⚡ Auto'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-3">Color principal</label>
                <div className="grid grid-cols-8 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.id}
                      onClick={() => updateSettings({ primaryColor: color.value })}
                      className={`w-full h-8 rounded-lg transition-all ${
                        settings.primaryColor === color.value
                          ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-800 scale-110 shadow-lg'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-3">Fondo degradado</label>
                <div className="grid grid-cols-4 gap-2">
                  {gradientOptions.map(gradient => (
                    <button
                      key={gradient.id}
                      onClick={() => updateSettings({ backgroundGradient: gradient.value })}
                      className={`h-10 rounded-lg bg-gradient-to-r ${gradient.value} transition-all ${
                        settings.backgroundGradient === gradient.value
                          ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-800 shadow-lg scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={gradient.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-3">Tamaño de fuente</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        settings.fontSize === size
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20'
                      }`}
                    >
                      {size === 'small' ? 'Pequeño' : size === 'medium' ? 'Mediano' : 'Grande'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-3">Estilo de tarjetas</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['rounded', 'sharp', 'circle'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => updateSettings({ cardStyle: style })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        settings.cardStyle === style
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20'
                      }`}
                    >
                      {style === 'rounded' ? 'Redondeado' : style === 'sharp' ? 'Recto' : 'Circular'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle: Animaciones */}
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-white/80 text-sm font-medium">Animaciones</span>
                <button
                  onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.animationsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      settings.animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </>
          )}

          {activeTab === 'gallery' && (
            <>
              <div>
                <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-3">Orden de fotos</label>
                <div className="space-y-2">
                  {([
                    { id: 'newest', label: 'Más recientes primero' },
                    { id: 'oldest', label: 'Más antiguas primero' },
                    { id: 'most_liked', label: 'Más gustadas' },
                  ] as const).map(order => (
                    <button
                      key={order.id}
                      onClick={() => updateSettings({ sortOrder: order.id })}
                      className={`w-full py-3 px-4 rounded-lg text-left text-sm font-medium transition-all ${
                        settings.sortOrder === order.id
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20'
                      }`}
                    >
                      {order.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-3">Diseño de galería</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['grid', 'masonry', 'list'] as const).map(layout => (
                    <button
                      key={layout}
                      onClick={() => updateSettings({ layout })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        settings.layout === layout
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/20'
                      }`}
                    >
                      {layout === 'grid' ? 'Cuadrícula' : layout === 'masonry' ? 'Mosaico' : 'Lista'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-3">Fotos por página</label>
                <input
                  type="range"
                  min="6"
                  max="24"
                  value={settings.photosPerPage}
                  onChange={(e) => updateSettings({ photosPerPage: parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-slate-500 dark:text-white/50 text-xs mt-1">
                  <span>6</span>
                  <span className="text-primary">{settings.photosPerPage}</span>
                  <span>24</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'showLikes' as const, label: 'Mostrar likes' },
                  { key: 'showUsernames' as const, label: 'Mostrar nombres' },
                  { key: 'showDescriptions' as const, label: 'Mostrar descripciones' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-white/80 text-sm font-medium">{label}</span>
                    <button
                      onClick={() => updateSettings({ [key]: !settings[key] })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        settings[key] ? 'bg-primary' : 'bg-slate-300 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          settings[key] ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'privacy' && (
            <>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <h3 className="text-amber-500 dark:text-amber-400 font-semibold">Página Privada</h3>
                    <p className="text-slate-600 dark:text-white/60 text-sm mt-1">
                      ARTXUS es una página privada. Solo personas con el código de acceso pueden entrar.
                    </p>
                    <p className="text-slate-500 dark:text-white/50 text-xs mt-2">
                      Código actual: <span className="font-mono text-primary">ARTXUS2026</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                <h3 className="text-slate-800 dark:text-white font-medium mb-3">Tu sesión</h3>
                <p className="text-slate-600 dark:text-white/60 text-sm mb-4">
                  Como usuario registrado, tus fotos se asocian a tu perfil.
                </p>
                <p className="text-slate-500 dark:text-white/50 text-xs leading-relaxed">
                  • Los invitados pueden ver y dar likes<br />
                  • Los registrados pueden subir fotos<br />
                  • Solo el autor puede eliminar sus fotos
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-slate-500 dark:text-white/50 text-xs text-center">
                  Tus preferencias se guardan automáticamente
                </p>
                <button
                  onClick={resetSettings}
                  className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                >
                  Restablecer configuración
                </button>
              </div>
            </>
          )}

          {activeTab === 'admin' && isAdmin && (
            <>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="text-red-500 dark:text-red-400 font-semibold">Panel de Administrador</h3>
                    <p className="text-slate-600 dark:text-white/60 text-xs mt-1">
                      Tienes control total sobre el contenido
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar TODAS las fotos? Esta acción no se puede deshacer.')) {
                      deleteAllPhotos();
                    }
                  }}
                  className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  Eliminar todas las fotos ({photos.length})
                </button>
              </div>

              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-slate-800 dark:text-white font-medium">
                    Historial Permanente
                  </h3>
                </div>
                
                {loginNotifications.length === 0 ? (
                  <p className="text-slate-500 dark:text-white/50 text-sm">No hay registros en el historial</p>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Sesiones */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2">Inicios de Sesión y Registro</h4>
                      <div className="space-y-2">
                        {loginNotifications.filter(n => n.type === 'login' || n.type === 'register').slice(0, 10).map(n => (
                          <div key={n.id} className="p-2 rounded-lg bg-slate-200/50 dark:bg-white/5 text-slate-700 dark:text-white/80 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {n.type === 'register' ? '📝' : '🔑'} <strong>{n.username}</strong>
                              </span>
                              <span className="text-slate-500 dark:text-white/50 text-xs">
                                {new Date(n.timestamp).toLocaleString('es-ES', { day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-white/50 text-xs">
                              {n.type === 'register' ? 'se registró en la plataforma' : 'inició sesión'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Publicaciones */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2 mt-4">Publicaciones (Fotos)</h4>
                      <div className="space-y-2">
                        {loginNotifications.filter(n => n.type === 'upload').slice(0, 10).map(n => (
                          <div key={n.id} className="p-2 rounded-lg bg-slate-200/50 dark:bg-white/5 text-slate-700 dark:text-white/80 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                🖼️ <strong>{n.username}</strong>
                              </span>
                              <span className="text-slate-500 dark:text-white/50 text-xs">
                                {new Date(n.timestamp).toLocaleString('es-ES', { day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-white/50 text-xs">
                              subió una nueva foto
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interacciones */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider mb-2 mt-4">Likes y Comentarios</h4>
                      <div className="space-y-2">
                        {loginNotifications.filter(n => n.type === 'like' || n.type === 'comment').slice(0, 10).map(n => (
                          <div key={n.id} className="p-2 rounded-lg bg-slate-200/50 dark:bg-white/5 text-slate-700 dark:text-white/80 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {n.type === 'like' ? '❤️' : '💬'} <strong>{n.username}</strong>
                              </span>
                              <span className="text-slate-500 dark:text-white/50 text-xs">
                                {new Date(n.timestamp).toLocaleString('es-ES', { day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-white/50 text-xs">
                              {n.type === 'like' ? 'dio like a una foto' : 'comentó en una foto'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                <h3 className="text-slate-800 dark:text-white font-medium mb-3">Fotos en el sistema ({photos.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {photos.slice(0, 10).map(p => (
                    <div key={p.id} className="flex items-center gap-2 p-2 bg-slate-200/50 dark:bg-white/5 rounded-lg">
                      <img src={p.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 dark:text-white text-sm truncate">@{p.username}</p>
                        <p className="text-slate-500 dark:text-white/50 text-xs truncate">
                          {p.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {photos.length > 10 && (
                    <p className="text-slate-500 dark:text-white/50 text-xs text-center">
                      ...y {photos.length - 10} más
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
