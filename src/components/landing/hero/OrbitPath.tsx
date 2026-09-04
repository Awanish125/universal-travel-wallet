'use client';

import { motion } from 'framer-motion';

interface OrbitPathProps {
  isLight: boolean;
}

export function OrbitPath({ isLight }: OrbitPathProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 1.3, ease: 'easeOut' }}
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    >
      <svg
        className="h-full w-full max-w-[560px]"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main outer elliptical flight orbit */}
        <ellipse
          cx="300"
          cy="280"
          rx="240"
          ry="150"
          stroke={isLight ? 'rgba(59, 130, 246, 0.35)' : 'rgba(56, 189, 248, 0.4)'}
          strokeWidth="1.8"
          strokeDasharray="6 8"
          className="animate-flight-path"
        />

        {/* Secondary inner orbital ring */}
        <ellipse
          cx="300"
          cy="290"
          rx="180"
          ry="110"
          stroke={isLight ? 'rgba(147, 51, 234, 0.25)' : 'rgba(168, 85, 247, 0.3)'}
          strokeWidth="1.2"
          strokeDasharray="4 6"
          className="opacity-70"
        />

        {/* Outer decorative halo ring */}
        <ellipse
          cx="300"
          cy="275"
          rx="275"
          ry="175"
          stroke={isLight ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.2)'}
          strokeWidth="1"
          strokeDasharray="2 12"
        />

        {/* Orbital node dots */}
        <circle cx="90" cy="230" r="3" fill="#38bdf8" className="animate-pulse" />
        <circle cx="510" cy="220" r="3.5" fill="#f59e0b" className="animate-pulse" />
        <circle cx="470" cy="360" r="2.5" fill="#f43f5e" />
        <circle cx="150" cy="380" r="3" fill="#a855f7" />
      </svg>
    </motion.div>
  );
}
