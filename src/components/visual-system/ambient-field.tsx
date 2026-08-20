"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type AmbientMode = "now" | "execution" | "rhythm" | "direction" | "calm" | "data" | "intelligence" | "settings";

const MODE_ENERGY: Record<AmbientMode, number> = {
  now: 1,
  execution: 0.55,
  rhythm: 0.62,
  direction: 0.58,
  calm: 0.32,
  data: 0.58,
  intelligence: 0.82,
  settings: 0.2,
};

function traceFlow(context: CanvasRenderingContext2D, width: number, height: number, elapsed: number, layer: number, bottom: boolean) {
  const steps = 54;
  const base = bottom ? height * 0.86 : height * 0.2;
  context.beginPath();
  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    const x = width * (-0.08 + progress * 1.16);
    const envelope = Math.sin(progress * Math.PI);
    const y = base
      + Math.sin(progress * Math.PI * (bottom ? 2.35 : 1.8) - elapsed * (bottom ? 0.07 : 0.045) + layer * 0.32) * height * (bottom ? 0.055 : 0.045)
      + Math.sin(progress * Math.PI * 5.2 + elapsed * 0.09 - layer * 0.18) * height * 0.012 * envelope
      + (layer - 4) * height * 0.0035;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
}

export function AmbientField({ mode = "now", active = false, className }: { mode?: AmbientMode; active?: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;
    let frame = 0;
    let width = 1;
    let height = 1;
    let previous = 0;
    let pageVisible = !document.hidden;
    const started = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const energy = MODE_ENERGY[mode] * (active ? 1.18 : 1);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.35);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const elapsed = (now - started) / 1000;
      context.clearRect(0, 0, width, height);
      context.save();
      context.globalCompositeOperation = "lighter";

      const wash = context.createRadialGradient(width * 0.6, height * 0.18, 0, width * 0.6, height * 0.18, width * 0.55);
      wash.addColorStop(0, `rgba(93, 189, 235, ${0.046 * energy})`);
      wash.addColorStop(0.46, `rgba(37, 86, 157, ${0.025 * energy})`);
      wash.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height * 0.72);

      const layers = mobile ? 4 : 9;
      for (const bottom of [false, true]) {
        for (let layer = 0; layer < layers; layer += 1) {
          traceFlow(context, width, height, elapsed, layer, bottom);
          const gradient = context.createLinearGradient(0, 0, width, 0);
          gradient.addColorStop(0, "rgba(59, 122, 214, 0)");
          gradient.addColorStop(0.28, `rgba(104, 194, 244, ${(bottom ? 0.03 : 0.009) * energy})`);
          gradient.addColorStop(0.57, `rgba(221, 250, 255, ${(bottom ? 0.075 : 0.016) * energy})`);
          gradient.addColorStop(0.82, `rgba(85, 161, 231, ${(bottom ? 0.032 : 0.01) * energy})`);
          gradient.addColorStop(1, "rgba(44, 96, 188, 0)");
          context.strokeStyle = gradient;
          context.lineWidth = bottom ? Math.max(5, height * (0.017 - layer * 0.001)) : Math.max(2, height * (0.0048 - layer * 0.00025));
          context.lineCap = "round";
          context.shadowColor = "rgba(118, 211, 255, .36)";
          context.shadowBlur = bottom ? 26 : 15;
          context.stroke();
        }
      }

      if (!mobile) {
        for (let layer = 0; layer < 7; layer += 1) {
          traceFlow(context, width, height, elapsed * 1.35, layer, true);
          context.setLineDash([width * 0.035, width * (0.08 + layer * 0.008)]);
          context.lineDashOffset = -elapsed * width * (0.008 + layer * 0.0007);
          context.strokeStyle = `rgba(224, 251, 255, ${0.055 * energy})`;
          context.lineWidth = layer % 3 === 0 ? 1.1 : 0.55;
          context.shadowBlur = 8;
          context.stroke();
        }
        context.setLineDash([]);
      }
      context.restore();
    };

    const loop = (now: number) => {
      if (pageVisible) {
        const interval = mobile ? 1000 / 18 : 1000 / 30;
        if (now - previous > interval) { previous = now; draw(now); }
      }
      if (!reduced) frame = requestAnimationFrame(loop);
    };
    const handleVisibility = () => { pageVisible = !document.hidden; };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();
    draw(started + 3100);
    if (!reduced) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [active, mode]);

  return <canvas ref={canvasRef} className={cn("ambient-field__canvas", className)} aria-hidden="true" />;
}
