import { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Photo, Comment } from '../types';
import * as fb from '../appwriteService';

export function PhotoCard({ photo, onDelete }: { photo: Photo; onDelete: () => void }) {
  const { currentUser, settings, toggleLike, addComment } = useAppStore();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasLiked = currentUser && photo.likes.includes(currentUser.id);
  const isOwner = currentUser?.id === photo.userId;

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    if (showComments) {
      // Fetch initial comments
      fb.getComments(photo.id).then(setComments);
      // Subscribe to real-time updates
      unsubscribe = fb.subscribeToComments(photo.id, setComments);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [showComments, photo.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(photo.id, newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const cardClass =
    settings.cardStyle === 'rounded'
      ? 'rounded-2xl'
      : settings.cardStyle === 'sharp'
      ? 'rounded-none'
      : 'rounded-3xl';

  return (
    <div
      className={`${cardClass} glass-card animate-in overflow-hidden transition-all duration-300 group bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/40 dark:border-white/10`}
      style={{ animationDelay: `${Math.random() * 0.5}s` }}
    >
      <div className="relative overflow-hidden">
        <img
          src={photo.imageUrl}
          alt={photo.description || 'Foto'}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
          style={{ aspectRatio: '1' }}
        />

        {isOwner && (
          <button
            onClick={onDelete}
            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
            title="Eliminar foto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        {settings.showUsernames && (
          <p className="text-slate-700 dark:text-white/80 text-sm font-medium mb-1">@{photo.username}</p>
        )}

        {settings.showDescriptions && photo.description && (
          <p className="text-slate-600 dark:text-white/60 text-sm mb-3">{photo.description}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLike(photo.id)}
              className={`flex items-center gap-1.5 transition-colors ${
                hasLiked ? 'text-pink-500' : 'text-white/60 hover:text-pink-400'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill={hasLiked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {settings.showLikes && <span className="text-sm">{photo.likes.length}</span>}
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 transition-colors ${
                showComments ? 'text-blue-400' : 'text-white/60 hover:text-blue-400'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm">Comentar</span>
            </button>
          </div>

          <span className="text-white/40 text-xs">{formatDate(photo.createdAt)}</span>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {comments.length === 0 ? (
                <p className="text-slate-400 dark:text-white/30 text-xs text-center py-2 italic">Sin comentarios aún</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="text-xs">
                    <span className="text-slate-700 dark:text-white/80 font-bold mr-2">{comment.username}</span>
                    <span className="text-slate-600 dark:text-white/60">{comment.text}</span>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Añadir comentario..."
                className="flex-1 bg-white/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 shadow-sm"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-blue-500/80 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isSubmitting ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function Gallery() {
  const { photos, settings, deletePhoto } = useAppStore();

  const sortedPhotos = useMemo(() => {
    const sorted = [...photos];
    switch (settings.sortOrder) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'most_liked':
        return sorted.sort((a, b) => b.likes.length - a.likes.length);
      default:
        return sorted;
    }
  }, [photos, settings.sortOrder]);

  if (photos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white/80 mb-2">No hay fotos todavía</h3>
        <p className="text-slate-600 dark:text-white/60 font-medium">¡Sé el primero en subir una foto!</p>
      </div>
    );
  }

  if (settings.layout === 'masonry') {
    return (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
        {sortedPhotos.map(photo => (
          <div key={photo.id} className="mb-4 break-inside-avoid">
            <PhotoCard photo={photo} onDelete={() => deletePhoto(photo.id)} />
          </div>
        ))}
      </div>
    );
  }

  const gridClass =
    settings.layout === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
      : 'grid grid-cols-1 max-w-2xl mx-auto gap-4';

  return (
    <div className={gridClass}>
      {sortedPhotos.map(photo => (
        <PhotoCard key={photo.id} photo={photo} onDelete={() => deletePhoto(photo.id)} />
      ))}
    </div>
  );
}
