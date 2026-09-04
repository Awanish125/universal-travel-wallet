'use client';

import { motion } from 'framer-motion';

interface DecorativeTravelTextProps {
  isLight: boolean;
}

const WORDS = [
  { text: 'Explore', rotate: -6, delay: 1.5 },
  { text: 'Spend', rotate: 2, delay: 1.62 },
  { text: 'Exchange', rotate: -3, delay: 1.74 },
  { text: 'Together ✨', rotate: 4, delay: 1.86 },
];

export function DecorativeTravelText({ isLight }: DecorativeTravelTextProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-25 overflow-visible">
      {/* Top Right Callout */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.4, ease: 'easeOut' }}
        className="absolute top-2 right-4 text-right sm:top-4 sm:right-6"
      >
        <motion.p
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`font-serif italic text-xs tracking-wider sm:text-sm drop-shadow-sm ${
            isLight ? 'text-sky-700' : 'text-sky-300'
          }`}
        >
          A smarter way to travel<br />the world ✨
        </motion.p>
      </motion.div>

      {/* Bottom Left Cursive Staggered Lines */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-col items-start gap-1"
      >
        {WORDS.map((word) => (
          <motion.span
            key={word.text}
            initial={{ opacity: 0, y: 18, rotate: word.rotate - 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, rotate: word.rotate, scale: 1 }}
            transition={{
              duration: 0.65,
              delay: word.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`font-serif italic text-sm tracking-wide sm:text-base font-semibold drop-shadow-sm ${
              isLight ? 'text-indigo-700' : 'text-indigo-300'
            }`}
          >
            {word.text}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
