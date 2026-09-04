'use client';

interface LoaderTextProps {
  titleRef: React.RefObject<HTMLDivElement>;
  subtitleRef: React.RefObject<HTMLDivElement>;
}

export default function LoaderText({ titleRef, subtitleRef }: LoaderTextProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 10,
        pointerEvents: 'none',
        width: '90%',
      }}
    >
      <div
        ref={titleRef}
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.6rem)',
          fontWeight: 600,
          letterSpacing: '0.35em',
          background: 'linear-gradient(90deg, #9B8CFF 0%, #C9B8FF 45%, #7C6FEF 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          marginBottom: '0.6em',
        }}
      >
        UNIVERSAL TRAVEL WALLET
      </div>

      <div
        ref={subtitleRef}
        style={{
          fontSize: 'clamp(0.55rem, 1.1vw, 0.75rem)',
          fontWeight: 400,
          letterSpacing: '0.3em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        OFFLINE-FIRST TRAVEL MONEY
      </div>
    </div>
  );
}
