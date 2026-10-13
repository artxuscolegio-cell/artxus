import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';

interface ImageEditorProps {
  imageSrc: string;
  onApply: (croppedFile: File) => void;
  onCancel: () => void;
  originalFileName?: string;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number = 0,
  fileName: string = 'edited.jpg'
): Promise<File> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => { image.onload = resolve; });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  // Canvas size to hold the rotated image
  const rotatedWidth  = image.width * cos + image.height * sin;
  const rotatedHeight = image.width * sin + image.height * cos;

  canvas.width  = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Offscreen canvas: rotate full image
  const offscreen = document.createElement('canvas');
  offscreen.width  = rotatedWidth;
  offscreen.height = rotatedHeight;
  const offCtx = offscreen.getContext('2d')!;
  offCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
  offCtx.rotate(radians);
  offCtx.drawImage(image, -image.width / 2, -image.height / 2);

  // Crop from the rotated image
  ctx.drawImage(
    offscreen,
    pixelCrop.x + (rotatedWidth  - image.width  * cos - image.height * sin) / 2,
    pixelCrop.y + (rotatedHeight - image.width  * sin - image.height * cos) / 2,
    pixelCrop.width,
    pixelCrop.height,
    0, 0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas is empty')); return; }
      resolve(new File([blob], fileName, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  });
}

const ASPECT_OPTIONS = [
  { label: 'Original', value: undefined },
  { label: '1:1',      value: 1 },
  { label: '4:3',      value: 4 / 3 },
  { label: '3:4',      value: 3 / 4 },
  { label: '16:9',     value: 16 / 9 },
];

export function ImageEditor({ imageSrc, onApply, onCancel, originalFileName }: ImageEditorProps) {
  const [crop, setCrop]                         = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom]                         = useState(1);
  const [rotation, setRotation]                 = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspect, setAspect]                     = useState<number | undefined>(undefined);
  const [applying, setApplying]                 = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleRotate = (deg: number) => {
    setRotation((prev) => (prev + deg + 360) % 360);
  };

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const file = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        originalFileName || 'edited.jpg'
      );
      onApply(file);
    } catch (e) {
      console.error('Error applying crop:', e);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Cropper area
          KEY FIX: objectFit="contain" makes the crop box move instead of the image.
          The image stays still and the selection area is what the user drags.
      */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ height: 300 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          objectFit="contain"
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: '1rem' },
            cropAreaStyle:  { borderColor: 'rgba(139,92,246,0.9)', borderWidth: 2 },
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 px-1">
        {/* Zoom */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-white/50 w-6">🔍</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-xs text-slate-500 dark:text-white/50 w-10 text-right">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Rotation */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-white/50 flex-shrink-0">🔄 Rotar:</span>
          <button
            type="button"
            onClick={() => handleRotate(-90)}
            className="px-3 py-1.5 bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-lg text-slate-700 dark:text-white text-xs font-medium transition-all"
          >
            −90°
          </button>
          <button
            type="button"
            onClick={() => handleRotate(90)}
            className="px-3 py-1.5 bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 rounded-lg text-slate-700 dark:text-white text-xs font-medium transition-all"
          >
            +90°
          </button>
          <span className="text-xs text-slate-500 dark:text-white/50 ml-1">{rotation}°</span>
        </div>

        {/* Aspect ratio */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-white/50 flex-shrink-0">✂️ Proporción:</span>
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setAspect(opt.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                aspect === opt.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-white/80 dark:hover:bg-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-slate-700 dark:text-white font-medium rounded-xl text-sm transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={applying}
          className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg hover:shadow-primary/40"
        >
          {applying ? 'Aplicando...' : '✓ Aplicar recorte'}
        </button>
      </div>
    </div>
  );
}
