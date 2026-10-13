import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { useAppStore } from '../store/useAppStore';
import { uploadImage } from '../appwriteService';
import { ImageEditor } from './ImageEditor';

export function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [description, setDescription] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);
  const originalFileName = useRef<string>('photo.jpg');

  const { addPhoto, isGuest } = useAppStore();

  const loadFilePreview = (file: File) => {
    originalFileName.current = file.name;
    selectedFile.current = file;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      // ── CHANGE: skip editor automatically, show preview directly ──
      setPreview(result);
      setEditorSrc(result);   // keep editorSrc ready in case the user wants to edit later
      setShowEditor(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      loadFilePreview(file);
    }
  };

  const handleEditorApply = (croppedFile: File) => {
    selectedFile.current = croppedFile;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      setPreview(e.target?.result as string);
      setEditorSrc(e.target?.result as string);
    };
    reader.readAsDataURL(croppedFile);
    setShowEditor(false);
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const resetForm = () => {
    setDescription('');
    setPreview(null);
    setUploadError(null);
    setShowEditor(false);
    setEditorSrc(null);
    selectedFile.current = null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile.current && !preview) return;

    setUploading(true);
    setUploadError(null);

    try {
      let finalImageUrl: string;

      if (selectedFile.current) {
        finalImageUrl = await uploadImage(selectedFile.current);
      } else {
        throw new Error('No se seleccionó ningún archivo.');
      }

      await addPhoto(finalImageUrl, description.trim() || undefined);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Error uploading to Appwrite Storage/Database:', error);
      setUploadError(
        error?.message || 'Error al subir la foto. Verifica tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/70 backdrop-blur-sm transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-white/10 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {showEditor ? '✂️ Editar imagen' : 'Subir Foto'}
          </h2>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── EDITOR MODE (only when user explicitly opens it) ── */}
        {showEditor && editorSrc ? (
          <ImageEditor
            imageSrc={editorSrc}
            onApply={handleEditorApply}
            onCancel={handleEditorCancel}
            originalFileName={originalFileName.current}
          />
        ) : (
          /* ── UPLOAD MODE ── */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Drop zone / preview */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !preview && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                preview ? 'cursor-default' :
                dragOver
                  ? 'border-primary bg-primary/10 cursor-pointer'
                  : 'border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 cursor-pointer'
              }`}
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-sm" />
                  <div className="flex justify-center gap-2 mt-3">
                    {/* Optional edit button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowEditor(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg text-sm font-medium transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                      </svg>
                      Editar
                    </button>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setEditorSrc(null); selectedFile.current = null; }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-lg text-sm font-medium transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400 dark:text-white/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-slate-600 dark:text-white/60 font-medium">Arrastrá una imagen o hacé clic para seleccionar</p>
                  <p className="text-slate-400 dark:text-white/30 text-xs mt-1">Podés editarla antes de subir (opcional)</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Description */}
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

            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                ❌ {uploadError}
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile.current || uploading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-primary/50 mt-4"
            >
              {uploading ? 'Comprimiendo y Subiendo...' : 'Subir Foto'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
