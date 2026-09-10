'use client';
import { forwardRef } from 'react';

const LeftPanel = forwardRef<HTMLDivElement>(function LeftPanel(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
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
          background: 'linear-gradient(120deg, rgba(155,140,255,0.10) 0%, transparent 70%)',
        }}
      />
    </div>
  );
});

export default LeftPanel;
