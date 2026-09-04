'use client';

import { motion } from 'framer-motion';

export interface CurrencyConfig {
  symbol: string;
  label: string;
  pos: string;
  gradient: string;
  glow: string;
  duration: number;
  delay: number;
  size: string;
  floatAnimation: {
    x?: number[];
    y?: number[];
    rotate?: number[];
    scale?: number[];
  };
}

export const CURRENCIES: CurrencyConfig[] = [
  {
    symbol: '$',
    label: 'US Dollar',
    pos: 'top-[8%] left-[18%]',
    gradient: 'from-sky-400 via-blue-500 to-blue-600',
    glow: 'rgba(56, 189, 248, 0.65)',
    duration: 4.8,
    delay: 0,
    size: 'h-12 w-12 text-lg sm:h-14 sm:w-14 sm:text-xl',
    floatAnimation: {
      y: [-10, 10, -10],
      x: [0, 0, 0],
    },
  },
  {
    symbol: '¥',
    label: 'Japanese Yen',
    pos: 'top-[14%] right-[12%]',
    gradient: 'from-amber-400 via-orange-500 to-amber-600',
    glow: 'rgba(251, 191, 36, 0.65)',
    duration: 5.4,
    delay: 0.25,
    size: 'h-12 w-12 text-base sm:h-14 sm:w-14 sm:text-lg',
    floatAnimation: {
      y: [-8, 8, -8],
      scale: [0.96, 1.05, 0.96],
    },
  },
  {
    symbol: '€',
    label: 'Euro',
    pos: 'top-[44%] left-[4%]',
    gradient: 'from-emerald-400 via-teal-500 to-emerald-600',
    glow: 'rgba(52, 211, 153, 0.65)',
    duration: 4.2,
    delay: 0.5,
    size: 'h-11 w-11 text-base sm:h-13 sm:w-13 sm:text-lg',
    floatAnimation: {
      x: [-9, 9, -9],
      y: [-3, 3, -3],
    },
  },
  {
    symbol: 'Rp',
    label: 'Indonesian Rupiah',
    pos: 'top-[52%] right-[4%]',
    gradient: 'from-rose-400 via-red-500 to-rose-600',
    glow: 'rgba(244, 63, 94, 0.65)',
    duration: 4.6,
    delay: 0.75,
    size: 'h-11 w-11 text-xs sm:h-13 sm:w-13 sm:text-sm',
    floatAnimation: {
      x: [-6, 6, -6],
      y: [6, -6, 6],
    },
  },
  {
    symbol: '£',
    label: 'British Pound',
    pos: 'bottom-[12%] left-[14%]',
    gradient: 'from-purple-400 via-fuchsia-500 to-indigo-600',
    glow: 'rgba(168, 85, 247, 0.65)',
    duration: 5.0,
    delay: 1.0,
    size: 'h-11 w-11 text-base sm:h-13 sm:w-13 sm:text-lg',
    floatAnimation: {
      rotate: [-8, 8, -8],
      y: [-6, 6, -6],
    },
  },
];

interface CurrencyBubbleGroupProps {
  isLight?: boolean;
}

export function CurrencyBubbleGroup({ isLight = false }: CurrencyBubbleGroupProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-25">
      {CURRENCIES.map((coin, index) => (
        <motion.div
          key={coin.symbol}
          initial={{ opacity: 0, scale: 0.3, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            delay: 1.2 + index * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`pointer-events-auto absolute ${coin.pos}`}
        >
          {/* Continuous floating loop */}
          <motion.div
            animate={coin.floatAnimation}
            transition={{
              duration: coin.duration,
              delay: coin.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{
              scale: 1.25,
              rotate: 8,
              transition: { type: 'spring', stiffness: 400, damping: 15 },
            }}
            className={`flex cursor-pointer select-none items-center justify-center rounded-full bg-gradient-to-br ${coin.gradient} font-black text-white ${coin.size} shadow-xl border-2 border-white/40 transition-shadow`}
            style={{
              boxShadow: isLight
                ? `0 6px 18px ${coin.glow}, 0 2px 6px rgba(0,0,0,0.1)`
                : `0 8px 24px ${coin.glow}, 0 0 16px ${coin.glow}`,
            }}
            title={coin.label}
          >
            <span className="drop-shadow-sm">{coin.symbol}</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
