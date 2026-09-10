'use client';

import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Wallet } from './hero/Wallet';
import { Globe } from './hero/Globe';
import { CurrencyBubbleGroup } from './hero/CurrencyBubble';
import { OrbitPath } from './hero/OrbitPath';
import { Airplane } from './hero/Airplane';
import { DecorativeTravelText } from './hero/DecorativeTravelText';
import { HeroParticles } from './hero/HeroParticles';

interface HeroVisualProps {
  isLight: boolean;
}

export function HeroVisual({ isLight }: HeroVisualProps) {
  const reducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Normalized mouse coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for expensive, premium feeling (Section 5)
  const springConfig = { stiffness: 180, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Card tilt
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);

  // Multi-layer depth translations (Section 4: Parallax multipliers)
  // Layer 2: Particles (0.10x)
  const particlesX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const particlesY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  // Layer 3: Orbit rings (0.15x)
  const orbitX = useTransform(smoothX, [-0.5, 0.5], [-12, 12]);
  const orbitY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);

  // Layer 4: Currency bubbles (0.20x)
  const currencyX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const currencyY = useTransform(smoothY, [-0.5, 0.5], [-16, 16]);

  // Layer 5: Airplane (0.25x)
  const airplaneX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const airplaneY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

  // Layer 6: Globe (0.30x)
  const globeX = useTransform(smoothX, [-0.5, 0.5], [-24, 24]);
  const globeY = useTransform(smoothY, [-0.5, 0.5], [-24, 24]);

  // Layer 7: Wallet (0.35x)
  const walletX = useTransform(smoothX, [-0.5, 0.5], [-28, 28]);
  const walletY = useTransform(smoothY, [-0.5, 0.5], [-28, 28]);

  // Layer 8: Decorative text (0.18x)
  const textX = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const textY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div className="flex items-center justify-center lg:col-span-5">
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={reducedMotion ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
        className="preserve-3d relative flex w-full max-w-[540px] items-center justify-center cursor-pointer select-none py-6"
      >
        {/* Layer 1: Ambient Background Glow (0.05x) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-3xl opacity-40 blur-3xl transition-colors duration-500"
          style={{
            background: isLight
              ? 'radial-gradient(circle at center, rgba(99, 102, 241, 0.22) 0%, rgba(59, 130, 246, 0.12) 60%, transparent 80%)'
              : 'radial-gradient(circle at center, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.2) 60%, transparent 80%)',
          }}
        />

        {/* 3D Visual Stage Container */}
        <div
          className={`preserve-3d relative w-full overflow-visible rounded-3xl border p-4 sm:p-6 transition-colors duration-500 ${
            isLight
              ? 'border-slate-200/80 bg-white/70 shadow-[0_20px_50px_rgba(99,102,241,0.12)]'
              : 'border-white/10 bg-[#0c0d11]/80 shadow-[0_25px_60px_rgba(0,0,0,0.7)]'
          }`}
        >
          {/* Layer 2: Hero Particles (0.10x) */}
          <motion.div style={reducedMotion ? undefined : { x: particlesX, y: particlesY }}>
            <HeroParticles isLight={isLight} />
          </motion.div>

          {/* Layer 3: Orbit Rings (0.15x) */}
          <motion.div style={reducedMotion ? undefined : { x: orbitX, y: orbitY }}>
            <OrbitPath isLight={isLight} />
          </motion.div>

          {/* Layer 6: Globe (0.30x) - sits inside/above the wallet */}
          <motion.div style={reducedMotion ? undefined : { x: globeX, y: globeY }}>
            <Globe isLight={isLight} />
          </motion.div>

          {/* Layer 7: Wallet (0.35x) */}
          <motion.div style={reducedMotion ? undefined : { x: walletX, y: walletY }}>
            <Wallet isLight={isLight} />
          </motion.div>

          {/* Layer 5: Airplane Flight Loop (0.25x) */}
          <motion.div style={reducedMotion ? undefined : { x: airplaneX, y: airplaneY }}>
            <Airplane isHovered={isHovered} />
          </motion.div>

          {/* Layer 4: Floating Currency Bubbles (0.20x) */}
          <motion.div style={reducedMotion ? undefined : { x: currencyX, y: currencyY }}>
            <CurrencyBubbleGroup isLight={isLight} />
          </motion.div>

          {/* Layer 8: Decorative Handwritten Text (0.18x) */}
          <motion.div style={reducedMotion ? undefined : { x: textX, y: textY }}>
            <DecorativeTravelText isLight={isLight} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
