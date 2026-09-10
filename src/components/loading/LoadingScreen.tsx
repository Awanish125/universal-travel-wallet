'use client';
import { useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import CenterSeam from './CenterSeam';
import LogoMark from './LogoMark';
import LoaderText from './LoaderText';
import DustParticles from './DustParticles';
import { useLoadingAnimation } from './useLoadingAnimation';
import './loading.css';

/**
 * Brand-matched loading screen: a door-split reveal (adapted from the KP
 * reference build) re-themed to Universal Travel Wallet's Soft Tactile brand:
 * the graphite canvas of ADR 009 with the violet accent as the only colour.
 * Colours come from the theme tokens, so the loader can never drift away from
 * the page it opens onto.
 */
export function LoadingScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLoadingAnimation({
    overlay: overlayRef,
    leftPanel: leftPanelRef,
    rightPanel: rightPanelRef,
    seam: seamRef,
    logo: logoRef,
    title: titleRef,
    subtitle: subtitleRef,
  });

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--background)',
        overflow: 'hidden',
        contain: 'layout paint',
      }}
    >
      <div className="loading-grain-overlay" />
      <LeftPanel ref={leftPanelRef} />
      <RightPanel ref={rightPanelRef} />
      <DustParticles canvasRef={canvasRef} />
      <CenterSeam ref={seamRef} />
      <LogoMark ref={logoRef} />
      <LoaderText titleRef={titleRef} subtitleRef={subtitleRef} />
    </div>
  );
}
