import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import * as fb from '../appwriteService';

export function AdminModerationPanel({ onClose }: { onClose: () => void }) {
  const { photos, currentUser } = useAppStore();
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, 'approved' | 'rejected'>>({});

  if (currentUser?.role !== 'admin') return null;

  // Show pending + recently moderated
  const pendingPhotos = photos.filter(p => (p.status === 'pending' || !p.status) && !done[p.id]);

  const handleApprove = async (photoId: string, userId: string) => {
    setLoading(prev => ({ ...prev, [photoId]: true }));
    try {
      await fb.updatePhotoStatus(photoId, 'approved');
      // Notify the uploader
      await fb.createAppNotification({
        toUserId: userId,
        fromUsername: 'Admin',
        type: 'moderation',
        message: '✅ Tu foto fue aprobada y ya es visible en la galería.',
        photoId,
      });
      setDone(prev => ({ ...prev, [photoId]: 'approved' }));
    } catch (e) {
      console.error('Error approving photo:', e);
    } finally {
      setLoading(prev => ({ ...prev, [photoId]: false }));
    }
  };

  const handleReject = async (photoId: string, userId: string, imageUrl: string) => {
    const reason = rejectReason[photoId]?.trim() || 'No cumple con las normas de la comunidad.';
    setLoading(prev => ({ ...prev, [photoId]: true }));
    try {
      await fb.updatePhotoStatus(photoId, 'rejected', reason);
      // Delete from storage
      await fb.deleteImage(imageUrl);
      // Notify the uploader with reason
      await fb.createAppNotification({
        toUserId: userId,
        fromUsername: 'Admin',
        type: 'moderation',
        message: `🚫 Tu foto fue eliminada. Motivo: ${reason}`,
        photoId,
      });
      // Remove from DB
      await fb.deletePhotoFromAppwrite(photoId);
      setDone(prev => ({ ...prev, [photoId]: 'rejected' }));
    } catch (e) {
      console.error('Error rejecting photo:', e);
    } finally {
      setLoading(prev => ({ ...prev, [photoId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">🛡️ Moderación de Fotos</h2>
            <p className="text-sm text-slate-500 dark:text-white/40 mt-0.5">
              {pendingPhotos.length} foto{pendingPhotos.length !== 1 ? 's' : ''} pendiente{pendingPhotos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {pendingPhotos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-white/30">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-medium">No hay fotos pendientes de revisión</p>
            </div>
          ) : (
            pendingPhotos.map(photo => (
              <div
                key={photo.id}
                className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <img
                    src={photo.imageUrl}
                    alt="Foto pendiente"
                    className="w-28 h-28 object-cover rounded-xl flex-shrink-0 border border-slate-200 dark:border-white/10"
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                        Pendiente
                      </span>
                      <span className="text-xs text-slate-400 dark:text-white/30">
                        @{photo.username}
                      </span>
                    </div>
                    {photo.description && (
                      <p className="text-sm text-slate-700 dark:text-white/80 mb-2 line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-white/30">
                      {photo.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Rejection reason input */}
                <div className="px-4 pb-3">
                  <input
                    type="text"
                    placeholder="Motivo de rechazo (opcional — default: No cumple las normas)"
                    value={rejectReason[photo.id] || ''}
                    onChange={e => setRejectReason(prev => ({ ...prev, [photo.id]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 px-4 pb-4">
                  <button
                    onClick={() => handleApprove(photo.id, photo.userId)}
                    disabled={loading[photo.id]}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 shadow-sm hover:shadow-emerald-500/30"
                  >
                    {loading[photo.id] ? '...' : '✅ Aprobar'}
                  </button>
                  <button
                    onClick={() => handleReject(photo.id, photo.userId, photo.imageUrl)}
                    disabled={loading[photo.id]}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 shadow-sm hover:shadow-red-500/30"
                  >
                    {loading[photo.id] ? '...' : '🚫 Rechazar y eliminar'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
