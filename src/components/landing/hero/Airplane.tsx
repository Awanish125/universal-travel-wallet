'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface AirplaneProps {
  isHovered?: boolean;
}

export function Airplane({ isHovered = false }: AirplaneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 1.4, ease: 'easeOut' }}
      className="pointer-events-none absolute inset-0 z-30"
    >
      {/* 3D Airplane traveling along the orbital ellipse */}
      <motion.div
        animate={{
          // Elliptical coordinate loop around center (rx=240, ry=140)
          x: [210, 150, 0, -150, -210, -150, 0, 150, 210],
          y: [-10, 85, 120, 85, -10, -85, -115, -85, -10],
          rotate: [20, 75, 130, 175, 205, 255, 310, 365, 380],
          scale: [1.08, 1.15, 1.1, 0.95, 0.82, 0.78, 0.85, 0.98, 1.08],
          zIndex: [35, 35, 35, 35, 5, 5, 5, 35, 35],
        }}
        transition={{
          duration: isHovered ? 9 : 14,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute left-1/2 top-1/2 -ml-6 -mt-6 flex h-12 w-12 items-center justify-center drop-shadow-[0_8px_20px_rgba(59,130,246,0.5)]"
      >
        <div className="relative h-11 w-11 transition-transform">
          <Image
            src="/assets/airplane.jpg"
            alt="Flying Jet"
            fill
            className="object-contain rounded-full"
          />

          {/* Glowing flight contrail tip */}
          <div className="pointer-events-none absolute -bottom-1 -left-1 h-3 w-3 rounded-full bg-sky-400/80 blur-xs" />
        </div>
      </motion.div>
    </motion.div>
  );
}
