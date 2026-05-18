import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  twinkle: boolean;
}

export function CursorSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useAppStore();
  const color = settings?.primaryColor || '#8b5cf6';
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const createParticle = (x: number, y: number, isExplosion = false) => {
      const angle = Math.random() * Math.PI * 2;
      // Explosions go faster, normal particles float gently
      const speed = isExplosion ? Math.random() * 6 + 2 : Math.random() * 1.5 + 0.2;
      const size = Math.random() * 3 + 0.5; // 0.5px to 3.5px (very tiny)
      
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isExplosion ? 0 : 0.3), // Float up slightly
        size,
        color,
        opacity: 1,
        life: 0,
        maxLife: isExplosion ? Math.random() * 20 + 20 : Math.random() * 60 + 40,
        twinkle: Math.random() > 0.7 // 30% of particles will twinkle
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      // 1. Trail effect (on cursor)
      if (Math.random() > 0.5) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY));
      }
      
      // 2. Cloud effect (around cursor)
      // Generate 2 particles in a 100-150px radius
      for (let i = 0; i < 2; i++) {
        const radius = Math.random() * 120 + 30; // 30px to 150px
        const angle = Math.random() * Math.PI * 2;
        const rx = e.clientX + Math.cos(angle) * radius;
        const ry = e.clientY + Math.sin(angle) * radius;
        
        // Only create if within screen bounds
        if (rx >= 0 && rx <= window.innerWidth && ry >= 0 && ry <= window.innerHeight) {
          particlesRef.current.push(createParticle(rx, ry));
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        
        // Trail
        if (Math.random() > 0.5) {
          particlesRef.current.push(createParticle(t.clientX, t.clientY));
        }
        
        // Cloud (smaller radius on mobile for better density)
        for (let i = 0; i < 2; i++) {
          const radius = Math.random() * 80 + 20;
          const angle = Math.random() * Math.PI * 2;
          const rx = t.clientX + Math.cos(angle) * radius;
          const ry = t.clientY + Math.sin(angle) * radius;
          
          if (rx >= 0 && rx <= window.innerWidth && ry >= 0 && ry <= window.innerHeight) {
            particlesRef.current.push(createParticle(rx, ry));
          }
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Small explosion on click
      for (let i = 0; i < 40; i++) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY, true));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('click', handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        
        // Fade out
        p.opacity = 1 - p.life / p.maxLife;
        
        // Organic drift (Brownian motion style)
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;

        // Remove dead particles
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Twinkle effect
        let currentOpacity = p.opacity;
        if (p.twinkle && Math.random() > 0.8) {
          currentOpacity = 0.1; // Dim suddenly
        }
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentOpacity;
        
        // Soft glow using shadow (Canvas native)
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = p.color;
        
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0; // reset shadow for next particle
      }
      
      requestAnimationFrame(animate);
    };
    
    const animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
