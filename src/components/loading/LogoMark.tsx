'use client';
import { forwardRef } from 'react';
import Image from 'next/image';

const LogoMark = forwardRef<HTMLDivElement>(function LogoMark(_, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '120px',
        height: '120px',
        zIndex: 10,
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      <Image
        src="/logo.png"
        alt="Universal Travel Wallet"
        width={120}
        height={120}
        priority
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 24px rgba(155,140,255,0.4))',
        }}
      />
    </div>
  );
});

export default LogoMark;
