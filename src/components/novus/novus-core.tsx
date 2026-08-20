"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type NovusCoreState = "idle" | "attention" | "positive" | "invoked" | "thinking";

interface NovusCoreProps {
  state?: NovusCoreState;
  variant?: "hero" | "panel" | "mark";
  className?: string;
}

const STATE_ENERGY: Record<NovusCoreState, number> = {
  idle: 0.7,
  attention: 0.92,
  positive: 0.82,
  invoked: 1.05,
  thinking: 1.28,
};

type Point = { x: number; y: number };

function traceClosedCurve(context: CanvasRenderingContext2D, points: Point[]) {
  const first = points[0];
  const last = points[points.length - 1];
  context.beginPath();
  context.moveTo((last.x + first.x) / 2, (last.y + first.y) / 2);
  for (let index = 0; index < points.length; index += 1) {
    const point = points[index];
    const next = points[(index + 1) % points.length];
    context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  }
  context.closePath();
}

export function NovusCore({ state = "idle", variant = "hero", className }: NovusCoreProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !root || !context) return;

    let frame = 0;
    let visible = true;
    let pageVisible = !document.hidden;
    let width = 1;
    let height = 1;
    const start = performance.now();
    let previous = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    const energy = STATE_ENERGY[state];

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.2 : 1.7);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const elapsed = (now - start) / 1000;
      context.clearRect(0, 0, width, height);
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.025;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.025;

      const short = Math.min(width, height);
      const centerX = width * 0.5 + pointerRef.current.x * short * 0.024;
      const centerY = height * 0.52 + pointerRef.current.y * short * 0.018;
      const baseRadius = short * (variant === "mark" ? 0.31 : 0.36);
      const layers = mobile ? 16 : variant === "mark" ? 13 : 24;
      const segments = mobile ? 84 : 132;

      context.save();
      context.globalCompositeOperation = "lighter";

      const aura = context.createRadialGradient(centerX, centerY, baseRadius * 0.08, centerX, centerY, baseRadius * 1.45);
      aura.addColorStop(0, `rgba(176, 239, 255, ${0.11 * energy})`);
      aura.addColorStop(0.42, `rgba(65, 174, 255, ${0.07 * energy})`);
      aura.addColorStop(1, "rgba(6, 16, 30, 0)");
      context.fillStyle = aura;
      context.beginPath();
      context.ellipse(centerX, centerY, baseRadius * 1.55, baseRadius * 1.16, -0.34, 0, Math.PI * 2);
      context.fill();

      // Broad refractive bands establish a continuous glass body beneath the finer filaments.
      for (let band = 0; band < (mobile ? 4 : 7); band += 1) {
        const phase = elapsed * (0.085 + band * 0.006) + band * 0.73;
        const points: Point[] = [];
        for (let segment = 0; segment < segments; segment += 1) {
          const angle = (segment / segments) * Math.PI * 2;
          const deformation = Math.sin(angle * 3 - phase * 1.5) * 0.065 + Math.cos(angle * 5 + phase) * 0.025;
          const radius = baseRadius * (0.79 + band * 0.045 + deformation);
          points.push({
            x: centerX + Math.cos(angle - 0.42) * radius * 1.28 + Math.sin(angle + phase) * baseRadius * 0.08,
            y: centerY + Math.sin(angle - 0.42) * radius * 0.72 + Math.cos(angle * 2 - phase) * baseRadius * 0.035,
          });
        }
        traceClosedCurve(context, points);
        const bandGradient = context.createLinearGradient(centerX - baseRadius * 1.4, centerY - baseRadius, centerX + baseRadius * 1.4, centerY + baseRadius);
        bandGradient.addColorStop(0, "rgba(45, 108, 231, 0.012)");
        bandGradient.addColorStop(0.32, `rgba(81, 180, 255, ${0.026 * energy})`);
        bandGradient.addColorStop(0.55, `rgba(214, 249, 255, ${(band % 3 === 0 ? 0.065 : 0.035) * energy})`);
        bandGradient.addColorStop(0.76, `rgba(80, 158, 255, ${0.025 * energy})`);
        bandGradient.addColorStop(1, "rgba(30, 82, 190, 0.008)");
        context.strokeStyle = bandGradient;
        context.lineWidth = baseRadius * (0.13 - band * 0.01);
        context.shadowColor = "rgba(90, 190, 255, .42)";
        context.shadowBlur = 22 + band * 2;
        context.stroke();
      }

      for (let layer = 0; layer < layers; layer += 1) {
        const depth = layer / Math.max(1, layers - 1);
        const phase = elapsed * (0.11 + energy * 0.035) + layer * 0.29;
        const points: Point[] = [];
        for (let segment = 0; segment < segments; segment += 1) {
          const angle = (segment / segments) * Math.PI * 2;
          const traveling = Math.sin(angle * 3 - phase * 1.7) * 0.07 + Math.sin(angle * 5 + phase * 1.13) * 0.034;
          const pulse = Math.sin(angle * 2 - elapsed * 0.31 + layer * 0.17) * 0.018;
          const radius = baseRadius * (0.64 + depth * 0.42 + traveling + pulse);
          const twist = -0.42 + Math.sin(elapsed * 0.095 + layer * 0.05) * 0.045;
          const localX = Math.cos(angle + twist) * radius * (1.27 + Math.sin(angle * 2 + phase) * 0.045);
          const localY = Math.sin(angle + twist) * radius * (0.72 + Math.cos(angle * 3 - phase) * 0.055);
          const shear = Math.sin(angle + elapsed * 0.14) * baseRadius * 0.13;
          points.push({ x: centerX + localX + shear, y: centerY + localY });
        }

        traceClosedCurve(context, points);
        const light = 0.045 + (1 - Math.abs(depth - 0.7)) * 0.095 * energy;
        context.strokeStyle = layer % 4 === 0
          ? `rgba(205, 248, 255, ${light * 1.45})`
          : layer % 3 === 0
            ? `rgba(88, 185, 255, ${light})`
            : `rgba(137, 226, 255, ${light * 0.72})`;
        context.lineWidth = layer % 5 === 0 ? 1.2 : 0.55;
        context.shadowColor = layer % 4 === 0 ? "rgba(164, 235, 255, .62)" : "rgba(54, 145, 255, .34)";
        context.shadowBlur = layer % 4 === 0 ? 11 : 5;
        context.stroke();
      }

      for (let filament = 0; filament < (mobile ? 4 : 7); filament += 1) {
        const orbit = elapsed * (0.075 + filament * 0.008) + filament * 1.41;
        const points: Point[] = [];
        for (let segment = 0; segment < segments; segment += 1) {
          const angle = (segment / segments) * Math.PI * 2;
          const wave = Math.sin(angle * (3 + (filament % 2)) - elapsed * (0.43 + filament * 0.025)) * baseRadius * 0.07;
          const radius = baseRadius * (0.78 + filament * 0.045) + wave;
          points.push({
            x: centerX + Math.cos(angle - 0.4) * radius * 1.28 + Math.sin(angle + orbit) * baseRadius * 0.09,
            y: centerY + Math.sin(angle - 0.4) * radius * 0.72 + Math.cos(angle * 2 - orbit) * baseRadius * 0.035,
          });
        }
        traceClosedCurve(context, points);
        context.setLineDash([baseRadius * 0.16, baseRadius * (0.24 + filament * 0.02)]);
        context.lineDashOffset = -elapsed * baseRadius * (0.055 + filament * 0.006);
        context.lineCap = "round";
        context.strokeStyle = `rgba(211, 250, 255, ${(0.24 - filament * 0.016) * energy})`;
        context.lineWidth = filament === 0 ? 1.8 : 0.85;
        context.shadowColor = "rgba(105, 211, 255, .8)";
        context.shadowBlur = filament === 0 ? 16 : 9;
        context.stroke();
      }

      context.setLineDash([]);
      context.restore();
    };

    const loop = (now: number) => {
      if (visible && pageVisible) {
        const interval = mobile ? 1000 / 30 : 1000 / 50;
        if (now - previous >= interval) {
          previous = now;
          draw(now);
        }
      }
      if (!reduced) frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    const resizeObserver = new ResizeObserver(resize);
    const handleVisibility = () => { pageVisible = !document.hidden; };
    observer.observe(root);
    resizeObserver.observe(root);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();
    draw(start + 2200);
    if (!reduced) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [state, variant]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current.targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointerRef.current.targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  };

  return (
    <div
      ref={rootRef}
      className={cn("novus-core", `novus-core--${variant}`, `novus-core--${state}`, className)}
      data-core-state={state}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { pointerRef.current.targetX = 0; pointerRef.current.targetY = 0; }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="novus-core__canvas" />
      <div className="novus-core__fallback">
        <Image src="/media/novus-core-transparent.png" alt="" fill sizes={variant === "panel" ? "520px" : "(max-width: 767px) 92vw, 760px"} priority={variant === "hero"} />
      </div>
    </div>
  );
}
