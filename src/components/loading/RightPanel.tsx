'use client';
import { forwardRef } from 'react';

const RightPanel = forwardRef<HTMLDivElement>(function RightPanel(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        background: 'var(--background-gradient)',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(240deg, rgba(124,111,239,0.18) 0%, transparent 70%)',
        }}
      />
    </div>
  );
});

export default RightPanel;
