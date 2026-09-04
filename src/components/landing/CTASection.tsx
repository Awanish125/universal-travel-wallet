'use client';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';
import { CardBird } from '../common/CardBird';

export function CTASection() {
  const reducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 220, damping: 22 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section id="get-started" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={reducedMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
          whileHover={reducedMotion ? undefined : { scale: 1.015 }}
          whileTap={reducedMotion ? undefined : { scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <SoftCard variant="floating" className="relative flex flex-col items-center gap-5 py-10 text-center sm:py-14">
            <CardBird />
            <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
              Ready for your next trip?
            </h2>
            <p className="max-w-md text-sm text-text-secondary sm:text-base">
              No account, no server, no signup. Your data stays on your device.
            </p>
            <SoftButton size="lg" className="rounded-lg">
              Create your first trip
            </SoftButton>
          </SoftCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
