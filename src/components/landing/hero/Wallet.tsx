'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface WalletProps {
  isLight: boolean;
  mouseX?: number;
  mouseY?: number;
}

export function Wallet({ isLight }: WalletProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto aspect-square w-full max-w-[380px] sm:max-w-[420px]"
    >
      {/* Subtle floating loop after entrance */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [-0.6, 0.6, -0.6],
        }}
        transition={{
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative h-full w-full overflow-hidden rounded-3xl"
      >
        <Image
          src={isLight ? '/assets/light/wallet.jpg' : '/assets/dark/wallet.jpg'}
          alt="Travel Wallet Case"
          fill
          priority
          className="object-contain transition-opacity duration-500"
        />

        {/* Ambient shadow beneath the wallet */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-4 inset-x-8 h-12 rounded-full opacity-40 blur-xl transition-colors duration-500"
          style={{
            background: isLight
              ? 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.25) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.7) 0%, transparent 70%)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
