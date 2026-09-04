'use client';

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' = 'light') {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(8);
          break;
        case 'medium':
          navigator.vibrate(15);
          break;
        case 'heavy':
          navigator.vibrate(25);
          break;
        case 'success':
          navigator.vibrate([10, 30, 20]);
          break;
      }
    } catch {
      // Ignore if vibration is restricted by browser policy
    }
  }
}
