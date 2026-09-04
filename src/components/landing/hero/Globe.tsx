'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface GlobeProps {
  isLight: boolean;
}

export function Globe({ isLight }: GlobeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, y: 40, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none absolute left-1/2 top-[10%] z-20 h-[210px] w-[210px] -translate-x-1/2 sm:top-[12%] sm:h-[250px] sm:w-[250px]"
    >
      {/* Globe independent floating loop + subtle slow spin */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 4, 0, -4, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative h-full w-full overflow-hidden rounded-full shadow-[0_12px_36px_rgba(37,99,235,0.35)]"
      >
        <Image
          src={isLight ? '/assets/light/globe.jpg' : '/assets/dark/globe.jpg'}
          alt="3D Earth Globe"
          fill
          priority
          className="object-cover rounded-full transition-opacity duration-500"
        />

        {/* Atmospheric rim highlight glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border border-sky-400/40 opacity-75 shadow-[inset_0_0_20px_rgba(56,189,248,0.4)]"
        />
      </motion.div>
    </motion.div>
  );
}
