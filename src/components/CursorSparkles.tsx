import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  dx: number;
  dy: number;
}

export function CursorSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const { settings } = useAppStore();
  const idRef = useRef(0);
  const color = settings?.primaryColor || '#8b5cf6'; // Default to violet if none

  useEffect(() => {
    const createSparkle = (x: number, y: number) => {
      // Create a cluster of 3 sparkles per move for the "fairy dust" effect
      const count = 3;
      const newSparklesArray: Sparkle[] = [];

      for (let i = 0; i < count; i++) {
        const offset = 30; // Max distance from cursor
        const rx = x + (Math.random() - 0.5) * offset;
        const ry = y + (Math.random() - 0.5) * offset;

        const newSparkle: Sparkle = {
          id: idRef.current++,
          x: rx,
          y: ry,
          size: Math.random() * 8 + 2, // 2px to 10px (smaller for dust)
          color: color,
          dx: (Math.random() - 0.5) * 60, // Random horizontal drift
          dy: (Math.random() - 0.5) * 60 - 20, // Random vertical drift (tends to go up)
        };

        newSparklesArray.push(newSparkle);

        // Remove the sparkle after animation (1s for a slower float)
        setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
        }, 1000);
      }

      setSparkles((prev) => [...prev, ...newSparklesArray]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      createSparkle(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        createSparkle(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [color]);

  return (
    <>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size * 2}px ${s.size}px ${s.color}aa`, // Stronger glow
            '--dx': `${s.dx}px`,
            '--dy': `${s.dy}px`,
            animationDuration: `${Math.random() * 0.5 + 0.5}s`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
