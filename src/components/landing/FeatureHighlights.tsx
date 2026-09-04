'use client';

import { motion } from 'framer-motion';
import { Globe, Coins, Users, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { label: 'Works Offline', icon: Globe },
  { label: 'Any Currency', icon: Coins },
  { label: 'For Solo & Groups', icon: Users },
  { label: 'Built for Travelers', icon: ShieldCheck },
];

export function FeatureHighlights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.6, ease: 'easeOut' }}
      className="mt-12 grid w-full max-w-3xl mx-auto grid-cols-2 gap-3.5 border-t border-border/60 pt-8 sm:grid-cols-4"
    >
      {FEATURES.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.6 + idx * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface-strong/60 p-2.5 shadow-sm transition-all duration-200 hover:border-accent/40"
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: 6 }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent shadow-sm transition-all duration-200 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.35)]"
            >
              <Icon className="h-4 w-4 text-sky-500 dark:text-sky-400" />
            </motion.div>
            <span className="text-xs font-semibold text-text-primary transition-colors group-hover:text-accent">
              {item.label}
            </span>

            {/* Micro accent highlight line on hover */}
            <span className="absolute bottom-0 left-3 right-3 h-[2px] w-0 bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300 group-hover:w-[calc(100%-24px)]" />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
