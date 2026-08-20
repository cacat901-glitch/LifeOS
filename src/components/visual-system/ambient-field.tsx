"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type AmbientMode = "now" | "execution" | "rhythm" | "direction" | "calm" | "data" | "intelligence" | "settings";

const MODE_ENERGY: Record<AmbientMode, number> = {
  now: 1,
  execution: 0.74,
  rhythm: 0.82,
  direction: 0.78,
  calm: 0.42,
  data: 0.76,
  intelligence: 1.08,
  settings: 0.28,
};

function traceFilament(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  index: number,
  pointerX: number,
  pointerY: number,
) {
  const phase = elapsed * (0.035 + index * 0.004) + index * 1.9;
  const startY = height * (0.08 + index * 0.145) + Math.sin(phase) * height * 0.07;
  const drift = Math.sin(phase * 0.7) * width * 0.08;
  context.beginPath();
  context.moveTo(-width * 0.14, startY);
  context.bezierCurveTo(
    width * 0.14 + drift,
    startY + Math.cos(phase * 1.3) * height * 0.2,
    width * 0.32 + pointerX * width * 0.012,
    startY - Math.sin(phase * 0.8) * height * 0.23,
    width * 0.51,
    startY + Math.cos(phase + 0.8) * height * 0.1,
  );
  context.bezierCurveTo(
    width * 0.68 + pointerX * width * 0.02,
    startY + Math.sin(phase * 1.1) * height * 0.25,
    width * 0.84,
    startY - Math.cos(phase * 0.9) * height * 0.17 + pointerY * height * 0.015,
    width * 1.14,
    startY + Math.sin(phase * 0.6) * height * 0.08,
  );
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
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    const started = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const energy = MODE_ENERGY[mode] * (active ? 1.18 : 1);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.35);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const elapsed = (now - started) / 1000;
      context.clearRect(0, 0, width, height);
      pointerX += (targetX - pointerX) * 0.018;
      pointerY += (targetY - pointerY) * 0.018;

      const wash = context.createRadialGradient(width * 0.57, height * 0.06, 0, width * 0.57, height * 0.06, Math.max(width, height) * 0.78);
      wash.addColorStop(0, `rgba(104, 207, 255, ${0.082 * energy})`);
      wash.addColorStop(0.34, `rgba(34, 92, 167, ${0.05 * energy})`);
      wash.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalCompositeOperation = "lighter";
      const count = mobile ? 3 : 6;
      for (let index = 0; index < count; index += 1) {
        traceFilament(context, width, height, elapsed, index, pointerX, pointerY);
        const gradient = context.createLinearGradient(0, 0, width, height * 0.25);
        gradient.addColorStop(0, "rgba(73, 145, 255, 0)");
        gradient.addColorStop(0.22, `rgba(112, 205, 255, ${0.045 * energy})`);
        gradient.addColorStop(0.52, `rgba(215, 250, 255, ${(index % 2 ? 0.09 : 0.14) * energy})`);
        gradient.addColorStop(0.78, `rgba(62, 132, 255, ${0.055 * energy})`);
        gradient.addColorStop(1, "rgba(73, 145, 255, 0)");
        context.strokeStyle = gradient;
        context.lineWidth = index % 2 ? 0.9 : 1.45;
        context.shadowColor = "rgba(85, 190, 255, .58)";
        context.shadowBlur = index % 2 ? 11 : 22;
        context.stroke();

        if (!mobile && index < 3) {
          context.setLineDash([width * 0.08, width * (0.11 + index * 0.02)]);
          context.lineDashOffset = -elapsed * width * (0.006 + index * 0.001);
          context.strokeStyle = `rgba(226, 252, 255, ${0.115 * energy})`;
          context.lineWidth = 1.25;
          context.stroke();
          context.setLineDash([]);
        }
      }
      context.restore();
    };

    const loop = (now: number) => {
      if (pageVisible) {
        const interval = mobile ? 1000 / 20 : 1000 / 30;
        if (now - previous >= interval) {
          previous = now;
          draw(now);
        }
      }
      if (!reduced) frame = requestAnimationFrame(loop);
    };

    const handlePointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX / Math.max(1, width) - 0.5;
      targetY = event.clientY / Math.max(1, height) - 0.5;
    };
    const handleVisibility = () => { pageVisible = !document.hidden; };

    resize();
    draw(started + 3400);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    if (!reduced) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [mode, active]);

  return <canvas ref={canvasRef} className={cn("ambient-field__canvas", className)} aria-hidden="true" />;
}
