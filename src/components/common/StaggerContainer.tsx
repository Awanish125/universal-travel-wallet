'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay = 0.06) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.02,
    },
  }),
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 25,
    },
  },
};

/**
 * StaggerContainer — Cascading entrance container for cards and lists.
 */
export function StaggerContainer({ children, className, staggerDelay = 0.06 }: Props) {
  return (
    <motion.div
      variants={containerVariants}
      custom={staggerDelay}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem — Child element inside a StaggerContainer.
 */
export function StaggerItem({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.div variants={itemVariants} className={className} onClick={onClick}>
      {children}
    </motion.div>
  );
}
