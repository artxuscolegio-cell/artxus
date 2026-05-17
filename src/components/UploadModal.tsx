import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { useAppStore } from '../store/useAppStore';
import { uploadImage } from '../appwriteService';

export function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  const { addPhoto, isGuest } = useAppStore();

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      selectedFile.current = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        setPreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageUrl) return;

    setUploading(true);
    
    try {
      let finalImageUrl = imageUrl;
      
      if (selectedFile.current) {
        finalImageUrl = await uploadImage(selectedFile.current);
      }
      
      addPhoto(finalImageUrl, description.trim() || undefined);
      setImageUrl('');
      setDescription('');
      setPreview(null);
      selectedFile.current = null;
      onClose();
    } catch (error) {
      console.error('Error uploading:', error);
      addPhoto(imageUrl, description.trim() || undefined);
      setImageUrl('');
      setDescription('');
      setPreview(null);
      selectedFile.current = null;
      onClose();
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/70 backdrop-blur-sm transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10 shadow-2xl transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Subir Foto</h2>
          <button onClick={onClose} className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-primary bg-primary/10'
                : 'border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40'
            }`}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-sm" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreview(null); setImageUrl(''); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400 dark:text-white/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-600 dark:text-white/60 font-medium">Arrastra una imagen o haz clic para seleccionar</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-white/80 text-sm font-medium mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="¿Qué estás compartiendo?"
              className="w-full px-4 py-3 bg-white/60 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none shadow-sm"
              rows={3}
            />
          </div>

          {isGuest && (
            <p className="text-amber-400 text-sm text-center">
              ⚠️ Estás subiendo como invitado. ¡Regístrate para guardar tu perfil!
            </p>
          )}

          <button
            type="submit"
            disabled={!imageUrl || uploading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-primary/50 mt-4"
          >
            {uploading ? 'Comprimiendo y Subiendo...' : 'Subir Foto'}
          </button>
        </form>
      </div>
    </div>
  );
}
