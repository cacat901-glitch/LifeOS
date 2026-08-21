"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function normalize(values: number[], width: number, height: number) {
  if (!values.length) return "";
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (maximum === minimum) {
    const dormantShape = [0, -.12, .06, -.04, .1, -.07, 0];
    return dormantShape.map((offset, index) => {
      const x = (index / (dormantShape.length - 1)) * width;
      const y = height * (.66 + offset);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }
  const range = Math.max(1, maximum - minimum);
  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((value - minimum) / range) * (height * 0.72) - height * 0.14;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

export function SignalTrace({ values, className, label = "Trend" }: { values: number[]; className?: string; label?: string }) {
  const id = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();
  const usableValues = values.filter(Number.isFinite);
  const dormant = usableValues.length > 0 && Math.max(...usableValues) === Math.min(...usableValues);

  if (!usableValues.length) {
    return <div className={cn("signal-trace signal-trace--empty", className)} aria-label={`${label}: no recorded data`} />;
  }

  const path = normalize(usableValues, 240, 72);
  const area = `${path} L240,72 L0,72 Z`;
  return (
    <svg viewBox="0 0 240 72" preserveAspectRatio="none" className={cn("signal-trace", dormant && "signal-trace--dormant", className)} role="img" aria-label={`${label}: ${usableValues.join(", ")}`}>
      <defs>
        <linearGradient id={`${id}-line`} x1="0" x2="1">
          <stop offset="0" stopColor="#4b8cff" stopOpacity=".25" />
          <stop offset=".52" stopColor="#d8fbff" />
          <stop offset="1" stopColor="#62d9ff" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ee6ff" stopOpacity=".18" />
          <stop offset="1" stopColor="#4b8cff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d={area} fill={`url(#${id}-area)`} />
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#${id}-line)`}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        filter={`url(#${id}-glow)`}
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export function RadialInstrument({ value, max = 100, label, className }: { value: number; max?: number; label: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  const safeValue = Math.min(max, Math.max(0, value));
  const progress = max ? safeValue / max : 0;
  const radius = 43;
  const circumference = Math.PI * 2 * radius;
  return (
    <div className={cn("radial-instrument", className)}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} className="radial-instrument__track" />
        <motion.circle
          cx="50" cy="50" r={radius}
          className="radial-instrument__value"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="radial-instrument__readout">
        <strong>{safeValue}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
