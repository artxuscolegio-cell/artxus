import { useState, useEffect, useRef } from 'react';
import type { AppNotification } from '../types';
import * as fb from '../appwriteService';
import { useAppStore } from '../store/useAppStore';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAppStore();

  useEffect(() => {
    if (!currentUser || currentUser.id === 'guest') return;

    const unsub = fb.subscribeToAppNotifications(currentUser.id, (notifs) => {
      setNotifications(notifs);
    });

    return () => { try { unsub(); } catch (_) {} };
  }, [currentUser?.id]);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const handleOpen = () => {
    setOpen(prev => !prev);
    // Mark all as read when opening
    if (!open) {
      notifications
        .filter(n => !n.read)
        .forEach(n => {
          fb.markAppNotificationRead(n.id);
          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
        });
    }
  };

  const typeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'comment': return '💬';
      case 'like':    return '❤️';
      case 'moderation': return '🚫';
      default:        return '🔔';
    }
  };

  const timeAgo = (date: Date) => {
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'hace un momento';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
  };

  if (!currentUser || currentUser.id === 'guest') return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        className="p-3 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 rounded-xl transition-all text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white shadow-sm relative"
        title="Notificaciones"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="notification-panel"
          className="absolute right-0 top-14 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notificaciones</h3>
            <span className="text-xs text-slate-400 dark:text-white/40">{notifications.length} total</span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 dark:text-white/30 text-sm">
                <p className="text-2xl mb-2">🔕</p>
                No tenés notificaciones aún
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex items-start gap-3 transition-colors ${
                    !n.read
                      ? 'bg-primary/5 dark:bg-primary/10'
                      : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-white leading-snug">{n.message}</p>
                    <p className="text-xs text-slate-400 dark:text-white/30 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
