'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * AnimatedNumber — Uses GSAP to smoothly interpolate numeric financial changes.
 * Complies with Point 66: Visual feedback only, underlying value is always accurate.
 */
export function AnimatedNumber({ value, decimals = 2, prefix = '', suffix = '', className = '' }: Props) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const obj = { val: prevValueRef.current };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: value,
        duration: 0.8,
        ease: 'power3.out',
        onUpdate: () => {
          if (node) {
            const formatted = obj.val.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            });
            node.textContent = `${prefix}${formatted}${suffix}`;
          }
        },
      });
    });

    prevValueRef.current = value;

    return () => ctx.revert();
  }, [value, decimals, prefix, suffix]);

  const initialFormatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={nodeRef} className={className}>
      {prefix}{initialFormatted}{suffix}
    </span>
  );
}
