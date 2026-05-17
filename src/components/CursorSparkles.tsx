import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export function CursorSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const { settings } = useAppStore();
  const idRef = useRef(0);
  const color = settings?.primaryColor || '#8b5cf6'; // Default to violet if none

  useEffect(() => {
    const createSparkle = (x: number, y: number) => {
      if (Math.random() > 0.5) return;

      const newSparkle: Sparkle = {
        id: idRef.current++,
        x: x,
        y: y,
        size: Math.random() * 10 + 5, // 5px to 15px
        color: color,
      };

      setSparkles((prev) => [...prev, newSparkle]);

      // Remove the sparkle after animation (0.8s)
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
      }, 800);
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
            left: s.x - s.size / 2,
            top: s.y - s.size / 2,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            boxShadow: `0 0 ${s.size}px ${s.size / 2}px ${s.color}80`,
            animationDuration: `${Math.random() * 0.5 + 0.5}s`,
          }}
        />
      ))}
    </>
  );
}
