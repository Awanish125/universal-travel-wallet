'use client';
import { motion } from 'framer-motion';
import { SoftCard } from '../common/SoftCard';

const STEPS = [
  { n: '01', title: 'Create a trip', body: 'Name it, pick a country and base currency. Everything else — participants, budget — can be added later.' },
  { n: '02', title: 'Spend & exchange', body: 'Log expenses and currency exchanges as they happen. Rates and splits are calculated automatically.' },
  { n: '03', title: 'Settle up', body: 'The app works out who owes whom, in plain language, right down to the last partial payment.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center text-2xl font-bold tracking-tight text-text-primary sm:mb-14 sm:text-4xl"
        >
          How it works
        </motion.h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
            >
              <SoftCard variant="elevated" className="h-full cursor-pointer">
                <span className="financial-num text-3xl font-bold text-accent">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{step.body}</p>
              </SoftCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
