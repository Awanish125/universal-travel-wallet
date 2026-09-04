'use client';
import { motion } from 'framer-motion';
import { Wallet, ArrowLeftRight, Users, PiggyBank, HandCoins, WifiOff } from 'lucide-react';
import { SoftCard } from '../common/SoftCard';
import { GradientIconTile, type GradientRole } from '../common/GradientIconTile';

const FEATURES: Array<{ title: string; description: string; icon: React.ReactNode; role: GradientRole }> = [
  {
    title: 'Any currency, any trip',
    description: 'Add as many currencies as your trip needs, with live and cached exchange rates.',
    icon: <ArrowLeftRight />,
    role: 'primary',
  },
  {
    title: 'Wallets that track themselves',
    description: 'Cash, card, bank, or UPI — balances update automatically as you spend and exchange.',
    icon: <Wallet />,
    role: 'sky',
  },
  {
    title: 'Split without the spreadsheet',
    description: 'Only the payer records an expense. Everyone else’s share is calculated for you.',
    icon: <Users />,
    role: 'mint',
  },
  {
    title: 'Settle in plain language',
    description: '“You pay”, “you take” — no jargon. Partial settlements and multi-currency payoffs supported.',
    icon: <HandCoins />,
    role: 'peach',
  },
  {
    title: 'Budgets that warn you early',
    description: 'Set a trip or daily budget and get alerted before you overspend, not after.',
    icon: <PiggyBank />,
    role: 'pink',
  },
  {
    title: 'Works with zero signal',
    description: 'Every core feature — expenses, wallets, settlements, history — works fully offline.',
    icon: <WifiOff />,
    role: 'teal',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
        >
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Everything a trip&apos;s money needs
          </h2>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            One offline-first app, built for travelers who cross currencies and split bills.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.02 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.08 }}
            >
              <SoftCard className="flex h-full flex-col gap-3 cursor-pointer">
                <GradientIconTile icon={feature.icon} role={feature.role} size="lg" />
                <h3 className="text-base font-semibold text-text-primary sm:text-lg">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </SoftCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
