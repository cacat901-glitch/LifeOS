"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useReducedMotion,
  animate,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  NotebookPen,
  Flame,
  Target,
  Dumbbell,
  Wallet,
  KanbanSquare,
  Sparkles,
  Command,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function LandingPage() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0b] font-sans text-neutral-300 antialiased selection:bg-[var(--signal)] selection:text-black">
      {/* scroll progress */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[var(--signal)]"
      />
      <div className="grid-bg pointer-events-none fixed inset-0 z-0 opacity-60" />
      {/* film grain for depth */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="relative z-10">
        <Nav />
        <Hero />
        <Bento />
        <Marquee />
        <Manifesto />
        <Features />
        <AISection />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}

// ── Animated number counter ────────────────────────────────
function Counter({
  to,
  duration = 1.6,
  format,
}: {
  to: number;
  duration?: number;
  format?: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return <span ref={ref}>{format ? format(val) : Math.round(val).toString()}</span>;
}

// ── Wordmark ───────────────────────────────────────────────
function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="h-2.5 w-2.5 rounded-[3px] bg-[var(--signal)] transition-transform duration-500 group-hover:rotate-[225deg]" />
      <span className="font-display text-[19px] font-semibold leading-none tracking-tight text-white">
        Novus
      </span>
    </Link>
  );
}

// ── Nav ────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Product", href: "#bento" },
    { label: "Intelligence", href: "#ai" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-white/[0.08] bg-[#0a0a0b]/80 backdrop-blur-xl" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 md:px-8">
        <Wordmark />
        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="hover-line font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href="/auth/login"
            className="hidden rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-300 transition-colors hover:text-white sm:inline-block"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--signal)] px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-black transition-transform hover:scale-[1.03]"
          >
            Start free
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ── Hero ───────────────────────────────────────────────────
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y = reduce ? 0 : yRaw;
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  const [clock, setClock] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="relative px-5 pt-40 md:px-8 md:pt-52">
      {/* faint accent glow for depth */}
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-[460px] w-[min(900px,90vw)] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(200,249,78,0.06), transparent 70%)" }}
      />
      {/* system metadata row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease, delay: 0.2 }}
        className="relative mx-auto flex max-w-[1240px] items-center justify-between border-b border-white/[0.08] pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
      >
        <span>[ Personal Operating System ]</span>
        <span className="hidden sm:inline">
          <span className="text-[var(--signal)]">●</span> Live {clock || "--:--:--"}
        </span>
        <span>v1.0 — 2026</span>
      </motion.div>

      <motion.div style={{ y, opacity }} className="relative mx-auto max-w-[1240px]">
        <h1 className="mt-10 font-display font-semibold leading-[0.92] tracking-[-0.03em] text-white">
          <Reveal delay={0.05}>
            <span className="block text-[length:clamp(2.6rem,11vw,9.5rem)]">Your entire life,</span>
          </Reveal>
          <Reveal delay={0.14}>
            <span className="block text-[length:clamp(2.6rem,11vw,9.5rem)] text-neutral-500">
              one&nbsp;<span className="italic text-[var(--signal)]">operating system.</span>
            </span>
          </Reveal>
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.4 }}
            className="max-w-xl text-pretty text-lg leading-relaxed text-neutral-400"
          >
            Habits, goals, journal, finance, workouts — unified, and run by an intelligence that
            understands the whole picture. Not another tracker. The mind that ties it together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.5 }}
            className="flex flex-col gap-3 sm:flex-row md:justify-end"
          >
            <Link
              href="/auth/register"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--signal)] px-7 py-4 text-sm font-semibold text-black transition-transform hover:scale-[1.02]"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#bento"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              See it in motion
            </a>
          </motion.div>
        </div>

        {/* index strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease, delay: 0.7 }}
          className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.08] pt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500"
        >
          {["AI-native", "Journal", "Habits", "Goals", "Finance", "Workouts", "Mood", "Timeline"].map(
            (t, i) => (
              <span key={t} className="flex items-center gap-6">
                {i !== 0 && <span className="text-neutral-700">/</span>}
                {t}
              </span>
            )
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, ease, delay }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}

// ── Bento product showcase ─────────────────────────────────
function Bento() {
  return (
    <section id="bento" className="px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-[1240px]">
        <SectionLabel index="01" label="The Workspace" />
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-6 max-w-3xl font-display text-[length:clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-white"
        >
          Everything in one calm canvas.
        </motion.h2>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-6 md:grid-rows-2"
        >
          {/* Briefing — large */}
          <Panel className="md:col-span-4 md:row-span-1">
            <div className="flex items-center justify-between">
              <Kicker icon={Sparkles}>Novus Briefing</Kicker>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">07:14</span>
            </div>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-neutral-200 md:text-xl">
              Good morning, David. You held your 12-day meditation streak and you&apos;re{" "}
              <span className="text-[var(--signal)]">68% toward your marathon goal</span>. Your energy
              peaks before noon — block one deep-work session on the project first.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Chip active>Ask Novus</Chip>
              <Chip>Review goals</Chip>
              <Chip>Start focus block</Chip>
            </div>
          </Panel>

          {/* Life score ring */}
          <Panel className="md:col-span-2 md:row-span-1">
            <Kicker icon={Target}>Life Score</Kicker>
            <div className="mt-4 flex items-center gap-5">
              <Ring value={82} />
              <div>
                <div className="font-display text-4xl font-semibold text-white">
                  <Counter to={82} />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  +6 this week
                </div>
              </div>
            </div>
          </Panel>

          {/* Habits */}
          <Panel className="md:col-span-2 md:row-span-1">
            <Kicker icon={Flame}>Habits</Kicker>
            <div className="mt-5 flex items-center gap-1.5">
              {[1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1].map((on, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-7 flex-1 rounded-[4px]",
                    on ? "bg-[var(--signal)]" : "border border-white/10 bg-transparent"
                  )}
                  style={on ? { opacity: 0.35 + (i / 12) * 0.65 } : undefined}
                />
              ))}
            </div>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              12-day streak · meditation
            </div>
          </Panel>

          {/* Finance sparkline */}
          <Panel className="md:col-span-2 md:row-span-1">
            <Kicker icon={Wallet}>Net worth</Kicker>
            <div className="mt-3 font-display text-3xl font-semibold text-white">
              £<Counter to={24180} format={(v) => Math.round(v).toLocaleString("en-GB")} />
            </div>
            <Sparkline />
          </Panel>

          {/* Command */}
          <Panel className="group md:col-span-2 md:row-span-1">
            <Kicker icon={Command}>Command</Kicker>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              Create, navigate or ask — anywhere.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Key>⌘</Key>
              <Key>K</Key>
              <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                to summon
              </span>
            </div>
          </Panel>
        </motion.div>
      </div>
    </section>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.div
      variants={fadeUp}
      onMouseMove={onMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015] p-6 transition-colors duration-300 hover:border-white/20",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(480px circle at var(--mx) var(--my), rgba(200,249,78,0.07), transparent 42%)",
        }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function Kicker({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
      <Icon className="h-3.5 w-3.5 text-[var(--signal)]" />
      {children}
    </div>
  );
}

function Chip({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-[var(--signal)] text-black"
          : "border border-white/12 text-neutral-300 hover:bg-white/5"
      )}
    >
      {children}
    </span>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-8 min-w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.03] px-2 font-mono text-sm text-white">
      {children}
    </span>
  );
}

function Ring({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
      <motion.circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c - dash }}
        viewport={{ once: true }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

function Sparkline() {
  const pts = [12, 14, 13, 17, 16, 20, 19, 24, 23, 28, 31, 30];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const w = 220;
  const h = 48;
  const path = pts
    .map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const yv = h - ((p - min) / (max - min)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${yv.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-12 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="var(--signal)" strokeWidth="1.5" />
    </svg>
  );
}

// ── Marquee ────────────────────────────────────────────────
function Marquee() {
  const reduce = useReducedMotion();
  const items = ["Think", "Plan", "Reflect", "Track", "Build", "Grow", "Focus", "Review"];
  return (
    <div className="mask-x relative overflow-hidden border-y border-white/[0.08] py-7">
      <motion.div
        className="flex gap-12 whitespace-nowrap pr-12"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items, ...items, ...items].map((it, i) => (
          <span
            key={i}
            className="flex items-center gap-12 font-display text-3xl font-medium tracking-tight text-neutral-700"
          >
            {it}
            <span className="text-[#c8f94e66]">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Manifesto ──────────────────────────────────────────────
function Manifesto() {
  return (
    <section className="px-5 py-28 md:px-8 md:py-40">
      <div className="mx-auto max-w-[1240px]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500"
          >
            The philosophy
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mt-8 max-w-5xl font-display text-[length:clamp(1.9rem,5.2vw,4.2rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-white"
          >
            Most apps track a slice of you.
            <span className="text-neutral-600"> Novus understands the whole — and tells you what actually matters today.</span>
          </motion.h2>
        </motion.div>
      </div>
    </section>
  );
}

// ── Features (editorial index) ─────────────────────────────
const features = [
  { n: "01", icon: NotebookPen, title: "Living journal", desc: "Write and reflect. Patterns surface across your moods and days." },
  { n: "02", icon: Flame, title: "Habits & streaks", desc: "Design the rhythm of your days with heatmaps and momentum." },
  { n: "03", icon: Target, title: "Goals & milestones", desc: "Set goals that matter and watch your trajectory toward them." },
  { n: "04", icon: Dumbbell, title: "Workout intelligence", desc: "Log sessions, sets and PRs. Training connects to your wellbeing." },
  { n: "05", icon: Wallet, title: "Finance clarity", desc: "Income, expenses and net worth in calm, legible detail." },
  { n: "06", icon: KanbanSquare, title: "Projects", desc: "Plan work with boards, notes and progress on one canvas." },
];

function Features() {
  return (
    <section id="features" className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <SectionLabel index="02" label="Capabilities" />
        <div className="mt-10 border-t border-white/[0.08]">
          {features.map((f) => (
            <motion.a
              key={f.n}
              href="/auth/register"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease }}
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-white/[0.08] py-7 transition-colors hover:bg-white/[0.02] md:gap-10 md:py-9"
            >
              <span className="font-mono text-xs text-neutral-600 md:text-sm">{f.n}</span>
              <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-8">
                <div className="flex items-center gap-3">
                  <f.icon className="h-5 w-5 shrink-0 text-[var(--signal)]" />
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
                    {f.title}
                  </h3>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-neutral-500">{f.desc}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-neutral-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--signal)]" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI section ─────────────────────────────────────────────
function AISection() {
  return (
    <section id="ai" className="px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp}>
            <SectionLabel index="03" label="Intelligence" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-6 font-display text-[length:clamp(2rem,5vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-white"
          >
            A companion that actually <span className="italic text-[var(--signal)]">knows you.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-neutral-400">
            Novus reads your whole life and acts on it. Ask it to create a habit, plan a goal, log
            your mood, or reset your data — and it actually does it. Not a chatbot in a corner; the
            intelligence at the center.
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-8 space-y-px">
            {[
              "Personalized daily briefings",
              "Real actions — create, plan, log, on command",
              "Grounded in your real data",
              "Swappable AI provider layer",
            ].map((t) => (
              <li
                key={t}
                className="flex items-center gap-3 border-t border-white/[0.08] py-3.5 text-sm text-neutral-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.015] p-5 md:p-7"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
            <span className="h-2 w-2 rounded-full bg-[var(--signal)]" />
            Novus — session
          </div>
          <div className="mt-5 space-y-3">
            <Bubble role="user">Create a habit to read 20 minutes every night.</Bubble>
            <Bubble role="ai">Done — &quot;Read 20 minutes&quot; added to your habits, nightly. Want me to set an 8pm reminder?</Bubble>
            <Bubble role="user">What should I focus on today?</Bubble>
            <Bubble role="ai">
              Your project is the highest-leverage item. Block two hours this morning while your
              energy peaks, then the workout you planned.
            </Bubble>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Bubble({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-[var(--signal)] text-black" : "border border-white/10 bg-white/[0.03] text-neutral-200"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ── How it works ───────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", t: "Bring your life in", d: "Add habits, goals, finances and more. Minutes, not hours." },
    { n: "02", t: "Novus learns the picture", d: "The AI reads your patterns and understands what matters." },
    { n: "03", t: "Get guided every day", d: "Wake to a briefing and act with clarity and momentum." },
  ];
  return (
    <section className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <SectionLabel index="04" label="How it works" />
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] md:grid-cols-3">
          {steps.map((s) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="bg-white/[0.015] p-8 md:p-10"
            >
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--signal)]">
                {s.n}
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="px-5 py-28 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <SectionLabel index="05" label="Pricing" />
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-6 font-display text-[length:clamp(2rem,5vw,3.6rem)] font-semibold tracking-[-0.02em] text-white"
        >
          Start free. Upgrade when ready.
        </motion.h2>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <PriceCard
            name="Free"
            price="£0"
            blurb="Everything you need to begin."
            features={["Up to 3 habits", "Journal & tasks", "Goals & mood", "Daily AI briefing"]}
            cta="Get started"
          />
          <PriceCard
            featured
            name="Pro"
            price="£9.99"
            blurb="The full Novus intelligence."
            features={[
              "Unlimited everything",
              "Advanced Novus AI + actions",
              "Life Timeline & statistics",
              "Finance & projects",
              "Data export",
            ]}
            cta="Start 7-day trial"
          />
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  name,
  price,
  blurb,
  features,
  cta,
  featured,
}: {
  name: string;
  price: string;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={cn(
        "flex flex-col rounded-2xl border p-8 md:p-10",
        featured ? "border-[#c8f94e66] bg-[#c8f94e0a]" : "border-white/[0.08] bg-white/[0.015]"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold text-white">{name}</h3>
        {featured && (
          <span className="rounded-full bg-[var(--signal)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-black">
            Popular
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-neutral-500">{blurb}</p>
      <div className="mt-6 font-display text-5xl font-semibold text-white">
        {price}
        <span className="text-base font-normal text-neutral-500">/mo</span>
      </div>
      <ul className="mt-8 flex-1 space-y-px">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 border-t border-white/[0.08] py-3 text-sm text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/auth/register"
        className={cn(
          "mt-8 inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-transform hover:scale-[1.02]",
          featured ? "bg-[var(--signal)] text-black" : "border border-white/15 text-white hover:bg-white/5"
        )}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}

// ── FAQ ────────────────────────────────────────────────────
const faqs = [
  { q: "Is Novus really free?", a: "Yes. The free plan covers the essentials including a daily AI briefing. Upgrade to Pro for unlimited use and advanced intelligence." },
  { q: "How does Novus AI work?", a: "Novus reads your real data — habits, goals, mood, finances — and generates guidance and can take real actions. It runs on a swappable provider layer." },
  { q: "Can it actually do things for me?", a: "Yes. Ask it to create a habit, plan a goal, log your mood or reset your data and it performs the action, asking you to confirm anything destructive first." },
  { q: "Is my data private?", a: "Your data is yours. It's encrypted, never sold, and you can export everything at any time." },
  { q: "Does it work on mobile?", a: "Novus is fully responsive with a dedicated mobile layout. A native app is on the roadmap." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <SectionLabel index="06" label="Questions" />
        <div className="mt-10 border-t border-white/[0.08]">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-white/[0.08]">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="font-display text-lg font-medium text-white md:text-xl">{f.q}</span>
                  {isOpen ? (
                    <Minus className="h-5 w-5 shrink-0 text-[var(--signal)]" />
                  ) : (
                    <Plus className="h-5 w-5 shrink-0 text-neutral-500" />
                  )}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-sm leading-relaxed text-neutral-400">{f.a}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="px-5 py-32 md:px-8 md:py-44">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease }}
        className="mx-auto max-w-[1240px] text-center"
      >
        <h2 className="font-display text-[length:clamp(2.8rem,12vw,11rem)] font-semibold leading-[0.9] tracking-[-0.03em] text-white">
          Begin your
          <br />
          <span className="italic text-[var(--signal)]">operating system.</span>
        </h2>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/register"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--signal)] px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.02]"
          >
            Start free today
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500">
            No credit card · Free forever
          </span>
        </div>
      </motion.div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────
function Footer() {
  const cols = [
    { h: "Product", items: ["Features", "Intelligence", "Pricing", "Changelog"] },
    { h: "Company", items: ["About", "Manifesto", "Contact"] },
    { h: "Legal", items: ["Privacy", "Terms", "Security"] },
  ];
  return (
    <footer className="border-t border-white/[0.08] px-5 pt-16 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid gap-10 pb-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
              Your personal operating system. One calm place to run your entire life.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600">{c.h}</div>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((it) => (
                  <li key={it}>
                    <span className="text-sm text-neutral-400 transition-colors hover:text-white">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-600 md:flex-row">
          <span>© {new Date().getFullYear()} Novus</span>
          <span className="hidden md:inline">Personal Operating System</span>
          <span>Made for a more intentional life</span>
        </div>
      </div>
    </footer>
  );
}

// ── Shared section label ───────────────────────────────────
function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease }}
      className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500"
    >
      <span className="text-[var(--signal)]">{index}</span>
      <span className="h-px w-8 bg-white/15" />
      {label}
    </motion.div>
  );
}
