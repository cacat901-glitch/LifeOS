"use client";

import { memo } from "react";
import { ArrowRight, Check, CircleAlert, ShieldCheck } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { NowLiquidField } from "./now-liquid-field";
import { OpticalSurface } from "@/components/visual-system/optical-surface";

export type IntelligenceState = "idle" | "focused" | "thinking" | "executing" | "complete" | "error";
export type IntelligenceResult = { type: string; ok: boolean; summary: string };

export function IntelligenceLiquid({ state }: { state: IntelligenceState }) {
  return <div className="intelligence-liquid" data-state={state} aria-hidden="true">
    <NowLiquidField mobile intelligence pixelRatioCap={1.15} activity={state === "thinking" || state === "executing" ? 2.1 : state === "focused" ? 1.3 : 1} />
  </div>;
}

export function NovusPromptRow({ children, index, onSelect }: { children: string; index: number; onSelect: () => void }) {
  return <OpticalSurface as="article" className="intelligence-prompt" light="upper">
    <button onClick={onSelect}><span>{String(index + 1).padStart(2, "0")}</span><strong>{children}</strong><ArrowRight aria-hidden="true" /></button>
  </OpticalSurface>;
}

// No raw HTML or remote image loads from model output.
export const IntelligenceResponse = memo(function IntelligenceResponse({ content }: { content: string }) {
  return <div className="intelligence-prose"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{
    img: ({ alt }) => <span>{alt}</span>,
    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
    table: ({ children }) => <div className="intelligence-table" tabIndex={0} role="region" aria-label="Response table"><table>{children}</table></div>,
  }}>{content}</Markdown></div>;
});

export function AIActionResults({ results }: { results: IntelligenceResult[] }) {
  return <div className="intelligence-results" aria-label="Action results">{results.map((result, index) =>
    <OpticalSurface key={index} light="quiet" className="intelligence-result" data-result={result.ok ? "success" : "failure"}>
      {result.ok ? <Check aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}<div><span>{result.ok ? "Action completed" : "Action failed"}</span><p>{result.summary}</p></div>
    </OpticalSurface>)}</div>;
}

export function AIActionConfirmation({ summary, executing, onConfirm, onCancel }: { summary: string[]; executing: boolean; onConfirm: () => void; onCancel: () => void }) {
  return <OpticalSurface className="intelligence-confirm" light="upper" aria-label="Action confirmation" aria-busy={executing}>
    <h3><ShieldCheck aria-hidden="true" /> Your confirmation is needed</h3>
    <ul>{(summary.length ? summary : ["Review this request before allowing Novus to change your data."]).map((item, index) => <li key={index}>{item}</li>)}</ul>
    <p>This permanently changes your data and can&apos;t be undone.</p>
    <div><button onClick={onConfirm} disabled={executing}>{executing ? "Executing action…" : "Confirm action"}</button><button onClick={onCancel} disabled={executing}>Cancel</button></div>
  </OpticalSurface>;
}
