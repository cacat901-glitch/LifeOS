"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { NovusMark, NovusLogo } from "@/components/shared/novus-logo";

const ease: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="aurora"><div className="aurora-blob" /></div>
      <div className="noise" />
      <Nav />
      <Hero />
      <Marquee />
      <Manifesto />
      <Features />
      <AISection />
      <CommandSection />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────
function Nav() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-between h-14 px-5 glass rounded-2xl">
          <NovusLogo size="sm" />
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#ai" className="hover:text-foreground transition-colors">Novus AI</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="text-sm px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors">Log in</Link>
            <Link href="/auth/register" className="text-sm font-medium px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.8)] hover:opacity-90 transition-opacity">
              Start free
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// ── Hero ───────────────────────────────────────────────────
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <section ref={ref} className="relative pt-40 md:pt-52 pb-24 px-4">
      <motion.div style={{ y, opacity, scale }} className="max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-muted-foreground mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now with Novus AI — powered by Gemini
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95] text-balance"
        >
          Your personal
          <br />
          <span className="gradient-text-aurora">operating system.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.25 }}
          className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty"
        >
          Novus is the intelligent companion for your entire life. One calm, beautiful place to think, plan, reflect, and grow — guided by an AI that understands the bigger picture.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/auth/register"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-base shadow-[0_12px_40px_-8px_rgba(99,102,241,0.7)] hover:shadow-[0_16px_50px_-8px_rgba(99,102,241,0.9)] transition-all">
            Start free
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <a href="#ai"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl glass font-medium text-base hover:bg-muted/40 transition-colors">
            See Novus AI
          </a>
        </motion.div>
        <p className="mt-4 text-xs text-muted-foreground">Free forever. No credit card required.</p>
      </motion.div>

      {/* Floating product mock */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, ease, delay: 0.5 }}
        className="relative max-w-4xl mx-auto mt-20"
        style={{ perspective: 1200 }}
      >
        <div className="glass-panel rounded-[28px] p-2 shadow-2xl">
          <div className="rounded-[22px] overflow-hidden bg-background/60 border border-border/40">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400/70" />
                <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
              </div>
            </div>
            <div className="p-7">
              <div className="flex items-start gap-4">
                <div className="pulse-ring relative"><NovusMark size="md" /></div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wide text-primary/70 mb-2">Novus Briefing</div>
                  <p className="text-base md:text-lg font-medium leading-relaxed text-foreground/90">
                    Good evening, David. Today was productive — you completed your workout and held your 12-day streak. You&apos;re 68% toward your marathon goal. Today&apos;s focus: one deep-work block on your project.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-medium">Ask Novus</span>
                    <span className="px-3 py-1.5 rounded-full bg-muted/50 text-xs">Review goals</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -inset-x-12 -bottom-12 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
}

// ── Marquee ────────────────────────────────────────────────
function Marquee() {
  const items = ["Journal", "Habits", "Goals", "Tasks", "Projects", "Finance", "Workouts", "Mood", "Timeline", "AI Coach"];
  return (
    <div className="relative py-8 overflow-hidden border-y border-border/40">
      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((it, i) => (
          <span key={i} className="text-2xl font-medium text-muted-foreground/40 flex items-center gap-10">
            {it} <span className="text-primary/30">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Manifesto ──────────────────────────────────────────────
function Manifesto() {
  return (
    <section className="py-28 md:py-40 px-4">
      <motion.div
        variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto text-center"
      >
        <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-primary/70 mb-6">The philosophy</motion.p>
        <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-balance">
          Not another habit tracker. Not another to-do list.
          <span className="text-muted-foreground"> A second brain that helps you run your entire life.</span>
        </motion.h2>
      </motion.div>
    </section>
  );
}

// ── Features ───────────────────────────────────────────────
const features = [
  { icon: "✦", title: "Living journal", desc: "Write, reflect, and watch patterns emerge across your moods and days." },
  { icon: "◎", title: "Habits & streaks", desc: "Design the rhythm of your days with heatmaps and momentum tracking." },
  { icon: "✧", title: "Goals & milestones", desc: "Set meaningful goals and see your trajectory toward them, visually." },
  { icon: "⟁", title: "Workout intelligence", desc: "Log sessions, sets, and PRs. Novus connects training to your wellbeing." },
  { icon: "◈", title: "Finance clarity", desc: "Track income, expenses and net worth with calm, beautiful charts." },
  { icon: "❖", title: "Projects", desc: "Plan work with kanban boards, notes and progress — all in one canvas." },
];

function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-primary/70 mb-4">Everything, unified</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-semibold tracking-tight">One canvas for your life.</motion.h2>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}
              className="group glass-panel rounded-[24px] p-7 lift">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── AI Section ─────────────────────────────────────────────
function AISection() {
  return (
    <section id="ai" className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative glass-panel rounded-[36px] p-8 md:p-16 overflow-hidden">
          <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
                <NovusMark size="sm" className="!h-4 !w-4 !text-[9px] !rounded-md" /> Novus AI
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-5">
                A companion that actually <span className="gradient-text">knows you.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg leading-relaxed mb-6">
                Every morning, Novus reads your whole life — habits, goals, mood, training, finances — and tells you what matters today. It&apos;s not a chatbot in a corner. It&apos;s the intelligence at the center of everything.
              </motion.p>
              <motion.ul variants={fadeUp} className="space-y-3">
                {["Personalized daily briefings", "Pattern recognition across your life", "Ask anything, grounded in your real data", "Built on a swappable provider layer"].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    {t}
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="glass rounded-[24px] p-6 space-y-4">
              <ChatBubble role="user">What should I focus on today?</ChatBubble>
              <ChatBubble role="ai">
                You&apos;ve held your meditation streak for 15 days — keep that anchor. Your mathematics project is the highest-leverage thing on your list. Block two focused hours this morning while your energy is highest, then reward yourself with the workout you planned.
              </ChatBubble>
              <ChatBubble role="user">Am I on track for my savings goal?</ChatBubble>
              <ChatBubble role="ai">
                You&apos;re at 82% with two months to spare. At your current pace you&apos;ll arrive early — nicely done.
              </ChatBubble>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white" : "bg-muted/60 text-foreground"
      }`}>
        {children}
      </div>
    </div>
  );
}

// ── Command Section ────────────────────────────────────────
function CommandSection() {
  return (
    <section className="py-24 px-4">
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center">
        <motion.p variants={fadeUp} className="text-sm uppercase tracking-widest text-primary/70 mb-4">The command center</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          Do anything in a keystroke.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10">
          Press <kbd className="px-2 py-1 rounded-lg bg-muted/60 border border-border/60 text-sm">⌘K</kbd> anywhere to create, navigate, search, or ask Novus.
        </motion.p>
        <motion.div variants={fadeUp} className="glass-strong rounded-[24px] overflow-hidden text-left max-w-xl mx-auto ring-1 ring-white/10">
          <div className="flex items-center gap-3 px-5 h-14 border-b border-border/60">
            <NovusMark size="sm" />
            <span className="text-muted-foreground text-sm">Ask Novus anything…</span>
            <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted/60 border border-border/60">ESC</kbd>
          </div>
          {["Create Task", "Start Workout", "Create Journal Entry", "Ask Novus"].map((c, i) => (
            <div key={c} className={`flex items-center gap-3 px-5 py-3 text-sm ${i === 3 ? "bg-primary/10" : ""}`}>
              <span className="w-2 h-2 rounded-full bg-primary/50" />
              {c}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── How it works ───────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", t: "Bring your life in", d: "Add your habits, goals, finances and more. It takes minutes." },
    { n: "02", t: "Novus learns the picture", d: "The AI reads your patterns and understands what matters." },
    { n: "03", t: "Get guided every day", d: "Wake up to a briefing and act with clarity and momentum." },
  ];
  return (
    <section className="py-24 px-4 bg-muted/10">
      <div className="max-w-5xl mx-auto">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-center mb-16">How it works</motion.h2>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <motion.div key={s.n} variants={fadeUp} className="glass-panel rounded-[24px] p-7">
              <div className="text-5xl font-semibold gradient-text mb-4">{s.n}</div>
              <h3 className="text-lg font-semibold mb-2">{s.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────
const testimonials = [
  { name: "Alex Chen", role: "Software Engineer", initials: "AC", quote: "Novus replaced five apps. The morning briefing genuinely changes how I start my day." },
  { name: "Sarah Mitchell", role: "Designer", initials: "SM", quote: "It feels less like software and more like a calm, intelligent companion. The design is breathtaking." },
  { name: "Marcus Rodriguez", role: "Founder", initials: "MR", quote: "The command center alone is worth it. ⌘K and I'm doing anything in a second." },
  { name: "Emily Park", role: "Medical Student", initials: "EP", quote: "Novus AI noticed patterns in my mood and study habits I never would have seen myself." },
];

function Testimonials() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-center mb-16">
          Loved by people who take growth <span className="gradient-text">seriously.</span>
        </motion.h2>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={fadeUp} className="glass-panel rounded-[24px] p-7">
              <p className="text-lg leading-relaxed mb-5 text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-semibold text-white">{t.initials}</div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-14">
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-semibold tracking-tight">Start free. Upgrade when ready.</motion.h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="glass-panel rounded-[28px] p-8">
            <h3 className="text-xl font-semibold mb-1">Free</h3>
            <p className="text-sm text-muted-foreground mb-6">Everything you need to begin.</p>
            <div className="text-4xl font-semibold mb-6">$0<span className="text-base text-muted-foreground font-normal">/mo</span></div>
            <ul className="space-y-3 mb-8">
              {["Up to 3 habits", "Journal & tasks", "Goals & mood", "Daily AI briefing"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm"><Check /> {f}</li>
              ))}
            </ul>
            <Link href="/auth/register" className="block text-center py-3 rounded-2xl glass font-medium hover:bg-muted/40 transition-colors">Get started</Link>
          </motion.div>

          <motion.div variants={fadeUp} className="relative glass-panel rounded-[28px] p-8 ring-2 ring-primary/40 overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-medium rounded-bl-2xl">Popular</div>
            <h3 className="text-xl font-semibold mb-1">Pro</h3>
            <p className="text-sm text-muted-foreground mb-6">The full Novus intelligence.</p>
            <div className="text-4xl font-semibold mb-6">$9.99<span className="text-base text-muted-foreground font-normal">/mo</span></div>
            <ul className="space-y-3 mb-8">
              {["Unlimited everything", "Advanced Novus AI", "Life Timeline", "Full statistics", "Finance & projects", "Data export"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm"><Check /> {f}</li>
              ))}
            </ul>
            <Link href="/auth/register" className="block text-center py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium shadow-[0_12px_32px_-8px_rgba(99,102,241,0.7)] hover:opacity-90 transition-opacity">Start 7-day trial</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Check() {
  return <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></span>;
}

// ── FAQ ────────────────────────────────────────────────────
const faqs = [
  { q: "Is Novus really free?", a: "Yes. The free plan covers the essentials including a daily AI briefing. Upgrade to Pro for unlimited use and advanced intelligence." },
  { q: "How does Novus AI work?", a: "Novus reads your real data — habits, goals, mood, finances — and generates personalized guidance. It's built on a provider layer (currently Google Gemini) so it can evolve over time." },
  { q: "Is my data private?", a: "Your data is yours. It's encrypted, never sold, and you can export everything at any time." },
  { q: "Does it work on mobile?", a: "Novus is fully responsive and beautiful on every device. A native app is on the roadmap." },
];

function FAQ() {
  return (
    <section id="faq" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-center mb-14">Questions</motion.h2>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-4">
          {faqs.map((f) => (
            <motion.div key={f.q} variants={fadeUp} className="glass-panel rounded-[20px] p-6">
              <h3 className="font-semibold mb-2">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-32 px-4">
      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
        className="relative max-w-4xl mx-auto text-center glass-panel rounded-[36px] p-12 md:p-20 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-60" />
        <div className="relative">
          <NovusMark size="lg" className="mx-auto mb-8 animate-float" />
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-5 text-balance">Begin your operating system.</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">Join thousands building a more intentional life with Novus.</p>
          <Link href="/auth/register"
            className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-lg shadow-[0_16px_50px_-8px_rgba(99,102,241,0.8)] hover:shadow-[0_20px_60px_-8px_rgba(99,102,241,1)] transition-all">
            Start free today
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border/40 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <NovusLogo size="sm" />
        <p className="text-sm text-muted-foreground">Your personal operating system.</p>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Novus. All rights reserved.</p>
      </div>
    </footer>
  );
}
