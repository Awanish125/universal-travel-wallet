'use client';

import { motion } from 'framer-motion';

interface HeroParticlesProps {
  isLight: boolean;
}

const PARTICLES = [
  { top: '15%', left: '25%', size: 4, color: '#38bdf8', duration: 4.2, delay: 0 },
  { top: '28%', left: '80%', size: 5, color: '#f59e0b', duration: 5.1, delay: 0.5 },
  { top: '65%', left: '15%', size: 3.5, color: '#a855f7', duration: 4.8, delay: 0.9 },
  { top: '75%', left: '82%', size: 4.5, color: '#f43f5e', duration: 4.4, delay: 0.3 },
  { top: '85%', left: '35%', size: 3, color: '#34d399', duration: 5.5, delay: 0.7 },
  { top: '35%', left: '10%', size: 3, color: '#60a5fa', duration: 4.6, delay: 1.1 },
];

export function HeroParticles({ isLight }: HeroParticlesProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-5 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: isLight ? [0.3, 0.7, 0.3] : [0.4, 0.9, 0.4],
            scale: [1, 1.3, 1],
            y: [-8, 8, -8],
            x: [-4, 4, -4],
          }}
          transition={{
            opacity: { duration: p.duration, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: p.duration, repeat: Infinity, ease: 'easeInOut' },
            y: { duration: p.duration * 1.2, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: p.duration * 1.5, repeat: Infinity, ease: 'easeInOut' },
            delay: p.delay,
          }}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            boxShadow: `0 0 12px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
