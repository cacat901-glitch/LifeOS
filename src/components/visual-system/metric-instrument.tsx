"use client";

import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadialInstrument } from "./instruments";
import { OpticalSurface, type OpticalLight } from "./optical-surface";

type MetricKind = "score" | "tasks" | "habits" | "progress" | "momentum";
const lighting: Record<MetricKind, OpticalLight> = { score: "upper", tasks: "stream", habits: "cadence", progress: "quiet", momentum: "signal" };
const trajectory = "M3 30 C32 30 32 7 60 7 S93 30 117 6";
const dormantSignal = "M2 30 H14 Q18 30 18 25 V21 Q18 17 22 17 H27 Q31 17 31 21 V27 Q31 31 35 31 H43 Q47 31 47 27 V25 Q47 21 51 21 H60 Q64 21 64 25 V28 Q64 32 68 32 H77 Q81 32 81 28 V21 Q81 17 85 17 H92 Q96 17 96 21 V25 Q96 29 100 29 H108";

function Meter({ label, amount, className, children }: {label: string; amount: number; className: string; children: ReactNode}) {
  return <div className={className} role="meter" aria-label={label} aria-valuenow={amount} aria-valuemin={0} aria-valuemax={100}>{children}</div>;
}

/** Data-only readouts: never synthesizes a historical series. Optical is an
 * explicit opt-in, so adopting this primitive does not reskin mobile/Spaces. */
export function MetricInstrument({ kind = "progress", label, value, detail, progress = 0, optical = false }: {
  kind?: MetricKind; label: string; value: number | string; detail: string; progress?: number; optical?: boolean;
}) {
  const amount = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  const className = cn("metric-instrument", `metric-instrument--${kind}`, amount === 0 && "is-dormant");
  const divisions = kind === "habits" && optical ? 15 : 10;
  const fill = (index: number) => ({ "--fill": `${Math.min(1, Math.max(0, amount / (100 / divisions) - index)) * 100}%` } as CSSProperties);
  const content = <>
    <div className="metric-instrument__head"><span>{label}</span><ArrowRight aria-hidden="true" /></div>
    <strong>{value}</strong><small>{detail}</small>
    {kind === "score" && <div className="score-calibration"><RadialInstrument value={amount} label="" className="metric-mini-radial" />{optical && <span className="score-calibration__ticks" aria-hidden="true" />}</div>}
    {kind === "tasks" && <Meter className="metric-bars" label="Task completion" amount={amount}>{Array.from({length: divisions}, (_, index) => <i key={index} style={{...fill(index),height:"100%"}} />)}{optical && <span className="instrument-zero" aria-hidden="true">0</span>}</Meter>}
    {kind === "habits" && <Meter className="metric-rhythm" label="Habit completion today, not a weekly history" amount={amount}>{Array.from({length: divisions}, (_, index) => <i key={index} style={fill(index)} />)}</Meter>}
    {kind === "progress" && <Meter className="now-completion-path" label="Overall completion" amount={amount}><svg viewBox="0 0 120 36" aria-hidden="true"><path d={trajectory} pathLength="100"/>{optical && <g className="trajectory-anchors"><circle cx="3" cy="30" r="1.6"/><circle cx="60" cy="7" r="1.6"/><circle cx="117" cy="6" r="1.6"/></g>}<path d={trajectory} pathLength="100" style={{strokeDasharray:`${amount} 100`}}/></svg></Meter>}
    {kind === "momentum" && <div className="now-momentum-dormant" aria-hidden="true"><svg viewBox="0 0 110 44">{optical && <path className="signal-depth" d={`${dormantSignal} V43 H2 Z`} />}<path d={dormantSignal}/></svg></div>}
  </>;
  return optical ? <OpticalSurface as="article" light={lighting[kind]} className={className}>{content}</OpticalSurface> : <article className={cn("target-instrument",className)}>{content}</article>;
}
