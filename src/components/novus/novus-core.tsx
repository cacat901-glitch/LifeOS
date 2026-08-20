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

const ENERGY: Record<NovusCoreState, number> = {
  idle: 0.72,
  attention: 0.94,
  positive: 0.86,
  invoked: 1.08,
  thinking: 1.28,
};

type RibbonPoint = { x: number; y: number };

function smoothPath(context: CanvasRenderingContext2D, points: RibbonPoint[]) {
  if (points.length < 2) return;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  }
  const last = points[points.length - 1];
  context.lineTo(last.x, last.y);
}

function fillRibbon(context: CanvasRenderingContext2D, upper: RibbonPoint[], lower: RibbonPoint[]) {
  if (!upper.length || !lower.length) return;
  context.beginPath();
  context.moveTo(upper[0].x, upper[0].y);
  upper.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  lower.slice().reverse().forEach((point) => context.lineTo(point.x, point.y));
  context.closePath();
}

export function NovusCore({ state = "idle", variant = "hero", className }: NovusCoreProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!root || !canvas || !context) return;

    let frame = 0;
    let width = 1;
    let height = 1;
    let visible = true;
    let pageVisible = !document.hidden;
    let previous = 0;
    const started = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const energy = ENERGY[state];

    const resize = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.15 : 1.65);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const buildRibbon = (elapsed: number, layer: number, count: number) => {
      const points: RibbonPoint[] = [];
      const steps = coarse ? 44 : 72;
      const panel = variant === "panel";
      const mark = variant === "mark";
      const baseY = panel ? 0.48 : mark ? 0.51 : 0.53;
      for (let index = 0; index <= steps; index += 1) {
        const progress = index / steps;
        const x = width * (-0.08 + progress * 1.16);
        const primary = Math.sin(progress * Math.PI * 2.12 + layer * 0.38 - elapsed * (0.13 + layer * 0.003));
        const secondary = Math.sin(progress * Math.PI * 4.7 - layer * 0.22 + elapsed * 0.19);
        const traveling = Math.sin(progress * Math.PI * 7.4 - elapsed * 0.42 + layer * 0.31);
        const envelope = Math.sin(progress * Math.PI);
        const curlEnvelope = Math.exp(-Math.pow((progress - .57) / .23, 2));
        const curl = Math.sin(progress * Math.PI * 3.6 + elapsed * .11 - layer * .17) * height * .052 * curlEnvelope;
        const liftedFold = -Math.exp(-Math.pow((progress - .53) / .13, 2)) * height * .16;
        const fallingFold = Math.exp(-Math.pow((progress - .72) / .11, 2)) * height * .09;
        const escapingLift = -Math.exp(-Math.pow((progress - .88) / .09, 2)) * height * .06;
        const spread = (layer - (count - 1) / 2) * height * (panel ? 0.012 : 0.009);
        const y = height * baseY
          + primary * height * (mark ? 0.18 : panel ? 0.12 : 0.16)
          + secondary * height * 0.035
          + traveling * height * 0.012 * envelope
          + curl
          + liftedFold
          + fallingFold
          + escapingLift
          + spread;
        points.push({ x, y });
      }
      return points;
    };

    const draw = (now: number) => {
      const elapsed = (now - started) / 1000;
      context.clearRect(0, 0, width, height);
      pointerRef.current.x += (pointerRef.current.tx - pointerRef.current.x) * 0.025;
      pointerRef.current.y += (pointerRef.current.ty - pointerRef.current.y) * 0.025;
      context.save();
      context.translate(pointerRef.current.x * width * 0.012, pointerRef.current.y * height * 0.014);
      context.globalCompositeOperation = "lighter";

      const wash = context.createRadialGradient(width * 0.58, height * 0.48, 0, width * 0.58, height * 0.48, Math.max(width, height) * 0.62);
      wash.addColorStop(0, `rgba(164, 232, 255, ${0.115 * energy})`);
      wash.addColorStop(0.34, `rgba(60, 145, 232, ${0.07 * energy})`);
      wash.addColorStop(1, "rgba(2, 8, 18, 0)");
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);

      for (let sheet = 0; sheet < (coarse ? 3 : 5); sheet += 1) {
        const upper = buildRibbon(elapsed * (1 + sheet * .008), sheet - 4.6, 10);
        const lower = buildRibbon(elapsed * (.97 + sheet * .006), sheet + 3.8, 10);
        fillRibbon(context, upper, lower);
        const sheetGradient = context.createLinearGradient(0, height * .75, width, height * .18);
        sheetGradient.addColorStop(0, "rgba(38, 91, 170, 0)");
        sheetGradient.addColorStop(.2, `rgba(82, 157, 221, ${.018 * energy})`);
        sheetGradient.addColorStop(.47, `rgba(205, 241, 251, ${(sheet % 2 ? .025 : .04) * energy})`);
        sheetGradient.addColorStop(.7, `rgba(105, 190, 242, ${.025 * energy})`);
        sheetGradient.addColorStop(1, "rgba(45, 97, 183, 0)");
        context.fillStyle = sheetGradient;
        context.shadowColor = "rgba(105, 202, 250, .38)";
        context.shadowBlur = 26;
        context.fill();
      }

      const sculpturalLayers = coarse ? 3 : 6;
      for (let layer = 0; layer < sculpturalLayers; layer += 1) {
        const drift = Math.sin(elapsed * .11 + layer * .7) * height * .018;
        const separation = (layer - (sculpturalLayers - 1) / 2) * height * .012;
        context.beginPath();
        context.moveTo(-width * .06, height * (.66 + layer * .006));
        context.bezierCurveTo(
          width * .2, height * (.82 - layer * .004),
          width * .34, height * (.73 + layer * .008) + drift,
          width * .49, height * (.43 + layer * .006) + separation,
        );
        context.bezierCurveTo(
          width * .58, height * (.24 + layer * .003) - drift,
          width * .69, height * (.25 - layer * .004),
          width * .76, height * (.47 + layer * .004) - separation,
        );
        context.bezierCurveTo(
          width * .84, height * (.7 - layer * .004) + drift,
          width * .94, height * (.31 + layer * .005),
          width * 1.08, height * (.36 - layer * .004),
        );
        const sculptGradient = context.createLinearGradient(0, height, width, 0);
        sculptGradient.addColorStop(0, "rgba(47, 105, 190, 0)");
        sculptGradient.addColorStop(.3, `rgba(109, 194, 238, ${.025 * energy})`);
        sculptGradient.addColorStop(.53, `rgba(228, 250, 255, ${(layer % 3 === 0 ? .105 : .055) * energy})`);
        sculptGradient.addColorStop(.72, `rgba(118, 203, 246, ${.045 * energy})`);
        sculptGradient.addColorStop(1, "rgba(58, 115, 203, 0)");
        context.strokeStyle = sculptGradient;
        context.lineWidth = height * (.115 - layer * .012);
        context.lineCap = "round";
        context.shadowColor = "rgba(163, 229, 255, .5)";
        context.shadowBlur = 30;
        context.stroke();
      }

      const broadLayers = coarse ? 6 : 10;
      for (let layer = 0; layer < broadLayers; layer += 1) {
        smoothPath(context, buildRibbon(elapsed, layer, broadLayers));
        const gradient = context.createLinearGradient(0, height * 0.7, width, height * 0.2);
        gradient.addColorStop(0, "rgba(37, 89, 167, 0)");
        gradient.addColorStop(0.18, `rgba(83, 164, 229, ${0.04 * energy})`);
        gradient.addColorStop(0.46, `rgba(220, 248, 255, ${(0.07 + (layer % 4 === 0 ? 0.055 : 0)) * energy})`);
        gradient.addColorStop(0.68, `rgba(119, 203, 255, ${0.058 * energy})`);
        gradient.addColorStop(1, "rgba(55, 105, 196, 0)");
        context.strokeStyle = gradient;
        context.lineWidth = height * (0.105 - layer * 0.0048);
        context.lineCap = "round";
        context.shadowColor = "rgba(116, 210, 255, .48)";
        context.shadowBlur = 22 + (layer % 3) * 9;
        context.stroke();
      }

      const filaments = coarse ? 7 : 12;
      for (let layer = 0; layer < filaments; layer += 1) {
        smoothPath(context, buildRibbon(elapsed * (1.08 + layer * 0.004), layer - 2.5, filaments));
        context.lineCap = "round";
        context.lineWidth = layer % 5 === 0 ? 1.45 : 0.62;
        context.strokeStyle = layer % 4 === 0
          ? `rgba(235, 253, 255, ${0.34 * energy})`
          : `rgba(125, 215, 255, ${(0.08 + (layer % 3) * 0.018) * energy})`;
        context.shadowColor = layer % 4 === 0 ? "rgba(207, 250, 255, .92)" : "rgba(78, 174, 255, .62)";
        context.shadowBlur = layer % 4 === 0 ? 13 : 7;
        context.stroke();

        if (!coarse && layer < 6) {
          context.setLineDash([width * 0.035, width * (0.055 + layer * 0.005)]);
          context.lineDashOffset = -elapsed * width * (0.018 + layer * 0.0015);
          context.strokeStyle = `rgba(244, 255, 255, ${0.22 * energy})`;
          context.lineWidth = 1.05;
          context.stroke();
          context.setLineDash([]);
        }
      }

      const particles = coarse ? 12 : 28;
      for (let index = 0; index < particles; index += 1) {
        const seed = (index * 0.61803398875) % 1;
        const progress = (seed + elapsed * (0.006 + (index % 4) * 0.0018)) % 1;
        const x = width * progress;
        const y = height * (0.5 + Math.sin(progress * Math.PI * 4.2 + index) * 0.19) + Math.sin(elapsed * 0.4 + index) * 5;
        const radius = index % 7 === 0 ? 1.4 : 0.55;
        context.fillStyle = `rgba(220, 250, 255, ${(0.16 + (index % 4) * 0.04) * energy})`;
        context.shadowColor = "rgba(137, 224, 255, .8)";
        context.shadowBlur = 7;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.restore();
    };

    const loop = (now: number) => {
      if (visible && pageVisible) {
        const interval = coarse ? 1000 / 24 : 1000 / 46;
        if (now - previous >= interval) {
          previous = now;
          draw(now);
        }
      }
      if (!reduced) frame = requestAnimationFrame(loop);
    };

    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    const resizeObserver = new ResizeObserver(resize);
    const handleVisibility = () => { pageVisible = !document.hidden; };
    intersection.observe(root);
    resizeObserver.observe(root);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();
    draw(started + 2300);
    if (!reduced) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [state, variant]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerRef.current.tx = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    pointerRef.current.ty = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
  };

  return (
    <div
      ref={rootRef}
      className={cn("novus-core", `novus-core--${variant}`, `novus-core--${state}`, className)}
      data-core-state={state}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => { pointerRef.current.tx = 0; pointerRef.current.ty = 0; }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="novus-core__canvas" />
      <div className="novus-core__fallback">
        <Image src="/media/novus-liquid-fallback.png" alt="" fill sizes={variant === "panel" ? "720px" : "(max-width: 767px) 100vw, 1100px"} priority={variant === "hero"} />
      </div>
    </div>
  );
}
