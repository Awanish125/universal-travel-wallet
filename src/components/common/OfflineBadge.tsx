'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBadge() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('offline', handleOffline);
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('online', handleOnline);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-2 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full shadow-lg font-extrabold text-xs flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Mode • Using Cached Rates</span>
          </div>
        </motion.div>
      )}

      {showReconnected && !isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-2 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="bg-emerald-500 text-white px-4 py-1.5 rounded-full shadow-lg font-extrabold text-xs flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <span>Back Online • Live Rates Active</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
