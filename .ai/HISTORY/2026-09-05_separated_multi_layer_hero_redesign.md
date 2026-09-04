# Session Log: Separated Multi-Layer Hero Redesign & 30-Section Specification

**Date:** 2026-09-05

## USER REQUEST
```text
You are redesigning and implementing the Travel Wallet homepage.
I will provide a reference screenshot/image.
IMPORTANT: The reference image is ONLY a visual design reference. Do not flatten the design into a single image and do not use the screenshot as the page background.
The entire homepage must be built as real HTML/CSS/React components with independently animated elements.
[...30-section comprehensive specification...]
```

## AI RESULT
- **Separated Visual Assets Architecture:**
  - Prepared separate visual layers for the Wallet, Globe, Airplane, Currency Tokens ($, €, £, ¥, Rp), Orbit Rings, Decorative Text, and Particles.
  - No flattened imagery: the globe is completely independent from the wallet, allowing distinct floating speeds and parallax depth.
  - Dedicated asset sets for both Dark Mode (`/assets/dark/wallet.jpg`, `/assets/dark/globe.jpg`) and Light Mode (`/assets/light/wallet.jpg`, `/assets/light/globe.jpg`).
- **Component Decomposition:**
  - Created `src/components/landing/HeroVisual.tsx` orchestrating 8 parallax depth tiers (`0.05x` to `0.35x`) using spring/lerp mouse hover tilt.
  - Created `src/components/landing/hero/Wallet.tsx`: independent float (`0 → -8px → 0`) and rotation.
  - Created `src/components/landing/hero/Globe.tsx`: independent float (`0 → -12px → 0`) and subtle spin.
  - Created `src/components/landing/hero/Airplane.tsx`: continuous flight loop along orbital ellipse with rotation following flight trajectory.
  - Created `src/components/landing/hero/CurrencyBubble.tsx`: individual float axes for `$`, `€`, `£`, `¥`, and `Rp` with interactive magnetic hover scale and glow.
  - Created `src/components/landing/hero/OrbitPath.tsx`: SVG orbital flight paths with animated dashed stroke.
  - Created `src/components/landing/hero/DecorativeTravelText.tsx`: staggered entrance for "Explore", "Spend", "Exchange", "Together" with floating motion.
  - Created `src/components/landing/hero/HeroParticles.tsx`: ambient 3D depth particles.
- **GSAP + Framer Motion Integration:**
  - GSAP handles the main headline line-by-line entrance with blur reduction and gradient text settling (`HeroContent.tsx`).
  - GSAP handles the viewport-triggered numeric count-up animations (`0 → 100%`, `0 -> 180+`, and `∞` scale/fade in `StatsSection.tsx`).
  - Framer Motion handles component entrances, spring button hover lifts, and theme transitions.
  - Animated primary CTA: airplane icon travels forward on hover, and the arrow moves to the right.
- **Light & Dark Mode Polish:**
  - Refined `.light` mode in `src/app/globals.css` with clean white/lavender background, crisp navy typography, and soft clay shadows.
  - Navbar and all components adapt seamlessly to theme toggling.
- **Verification:**
  - TypeScript typecheck passed with 0 errors (`npm run typecheck`).
  - Vitest test suite passed with 25/25 tests (`npm run test`).
  - Next.js production build succeeded (`npm run build`).
