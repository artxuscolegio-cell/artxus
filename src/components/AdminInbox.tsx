import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { LoginNotification } from '../types';

type FilterType = 'all' | 'sessions' | 'uploads' | 'interactions';

export function AdminInbox() {
  const { loginNotifications, clearAllNotifications, markNotificationRead } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const getMessage = (notif: LoginNotification) => {
    switch (notif.type) {
      case 'login':
        return `inició sesión.`;
      case 'register':
        return `se registró en la plataforma.`;
      case 'upload':
        return `subió una nueva foto.`;
      case 'comment':
        return `comentó en una foto.`;
      case 'like':
        return `le dio like a una foto.`;
      default:
        return `hizo algo.`;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
    });
  };

  const filteredNotifications = loginNotifications.filter(notif => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'sessions') return notif.type === 'login' || notif.type === 'register';
    if (activeFilter === 'uploads') return notif.type === 'upload';
    if (activeFilter === 'interactions') return notif.type === 'comment' || notif.type === 'like';
    return true;
  });

  return (
    <div className="glass-card rounded-2xl p-6 bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Bandeja de Entrada</h2>
        <button
          onClick={clearAllNotifications}
          className="text-xs text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white transition-colors"
        >
          Limpiar todo
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'all'
              ? 'bg-primary text-white'
              : 'bg-white/50 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-white/80 dark:hover:bg-white/20'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveFilter('sessions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'sessions'
              ? 'bg-blue-500 text-white'
              : 'bg-white/50 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-white/80 dark:hover:bg-white/20'
          }`}
        >
          Sesiones
        </button>
        <button
          onClick={() => setActiveFilter('uploads')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'uploads'
              ? 'bg-green-500 text-white'
              : 'bg-white/50 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-white/80 dark:hover:bg-white/20'
          }`}
        >
          Fotos
        </button>
        <button
          onClick={() => setActiveFilter('interactions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeFilter === 'interactions'
              ? 'bg-pink-500 text-white'
              : 'bg-white/50 dark:bg-white/10 text-slate-600 dark:text-white/60 hover:bg-white/80 dark:hover:bg-white/20'
          }`}
        >
          Likes y Comentarios
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-3">
        {filteredNotifications.length === 0 ? (
          <p className="text-slate-400 dark:text-white/30 text-sm text-center py-4 italic">No hay notificaciones en esta categoría</p>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                notif.read
                  ? 'bg-white/10 dark:bg-white/5'
                  : 'bg-white/60 dark:bg-white/10 border-l-4 border-violet-500'
              }`}
              onClick={() => markNotificationRead(notif.id)}
            >
              <p className="text-sm text-slate-700 dark:text-white/80">
                <span className="font-bold">@{notif.username}</span> {getMessage(notif)}
              </p>
              <p className="text-xs text-slate-400 dark:text-white/40 mt-1">{formatDate(notif.timestamp)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
