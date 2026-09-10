'use client';
import { motion } from 'framer-motion';
import { SoftCard } from '../common/SoftCard';
import { ScrollReveal } from '../common/ScrollReveal';

const STEPS = [
  { n: '01', title: 'Create a trip', body: 'Name it and pick where you are going. The money spent there is filled in for you; companions and budgets can wait.' },
  { n: '02', title: 'Spend & exchange', body: 'Log what you spend and the money you change. Rates and each person’s share are worked out for you.' },
  { n: '03', title: 'Settle up', body: 'The app works out who owes whom, in plain language, right down to the last partial payment.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal className="mb-10 text-center sm:mb-14" staggerChildren={false} from="top">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
            How it works
          </h2>
        </ScrollReveal>

        <ScrollReveal
          from="left"
          distance={48}
          stagger={0.12}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.n}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <SoftCard variant="elevated" className="h-full cursor-pointer">
                <span className="financial-num text-3xl font-bold text-accent">{step.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{step.body}</p>
              </SoftCard>
            </motion.div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
