'use client';
import { useEffect } from 'react';

interface DustParticlesProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export default function DustParticles({ canvasRef }: DustParticlesProps) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId: number;
    const particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function spawn(): Particle {
      return {
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(0.25 + Math.random() * 0.5),
        size: 0.8 + Math.random() * 1.5,
        alpha: 0.12 + Math.random() * 0.3,
      };
    }

    resize();
    const count = reducedMotion ? 0 : 50;
    for (let i = 0; i < count; i++) {
      const p = spawn();
      p.y = Math.random() * window.innerHeight;
      particles.push(p);
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.0005;

        if (p.y < -10 || p.alpha <= 0) {
          Object.assign(p, spawn());
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155,140,255,${p.alpha})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    if (!reducedMotion) draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
