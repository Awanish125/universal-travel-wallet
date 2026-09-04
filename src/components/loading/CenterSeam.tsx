'use client';
import { forwardRef } from 'react';

const CenterSeam = forwardRef<HTMLDivElement>(function CenterSeam(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '3px',
        height: '100%',
        background: '#fff',
        boxShadow: [
          '-3px 0 16px 5px rgba(155,140,255,0.55)',
          '3px 0 16px 5px rgba(124,111,239,0.55)',
          '0 0 6px 2px rgba(255,255,255,0.85)',
        ].join(', '),
        opacity: 0,
        willChange: 'opacity',
      }}
    />
  );
});

export default CenterSeam;
