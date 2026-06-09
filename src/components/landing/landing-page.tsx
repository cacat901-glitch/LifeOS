"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// ============================================================
// LANDING PAGE - Complete SaaS Landing
// ============================================================

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}

// ============================================================
// NAVBAR
// ============================================================

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl">LifeOS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <a href="/auth/login">Log In</a>
            </Button>
            <Button size="sm" variant="glow">
              <a href="/auth/register">Start Free</a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// HERO
// ============================================================

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Badge variant="secondary" className="mb-6 px-4 py-1.5">
          ✨ Your personal operating system
        </Badge>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]">
          One app to run your{" "}
          <span className="gradient-text">entire life.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Journal, habits, goals, workouts, mood tracking, and AI insights — all in one premium platform. 
          Stop switching between apps. Start living intentionally.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" variant="glow">
            <a href="/auth/register" className="flex items-center gap-2">
              Start Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </Button>
          <Button size="xl" variant="outline">
            <a href="#features">See Features</a>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Free forever. No credit card required.
        </p>

        {/* Dashboard Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-2 shadow-2xl max-w-5xl mx-auto">
            <div className="rounded-xl bg-card border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    app.lifeos.io/dashboard
                  </div>
                </div>
              </div>
              <div className="p-8 min-h-[300px] bg-gradient-to-br from-background to-muted/30">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Life Score */}
      <div className="rounded-xl border bg-card p-4">
        <div className="text-xs text-muted-foreground mb-2">Life Score</div>
        <div className="text-3xl font-bold gradient-text">87</div>
        <div className="text-xs text-green-500 mt-1">↑ 5% from last week</div>
        <div className="mt-3 h-2 bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full w-[87%] bg-primary rounded-full" />
        </div>
      </div>

      {/* Today's Habits */}
      <div className="rounded-xl border bg-card p-4">
        <div className="text-xs text-muted-foreground mb-2">Today&apos;s Habits</div>
        <div className="text-3xl font-bold">5/7</div>
        <div className="text-xs text-muted-foreground mt-1">🔥 12 day streak</div>
        <div className="mt-3 flex gap-1">
          {[true, true, true, true, true, false, false].map((done, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${done ? "bg-green-500" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="rounded-xl border bg-card p-4">
        <div className="text-xs text-muted-foreground mb-2">Today&apos;s Mood</div>
        <div className="text-3xl">😊</div>
        <div className="text-xs text-muted-foreground mt-1">Feeling good</div>
        <div className="mt-3 flex items-center gap-1">
          {[6, 7, 8, 7, 8, 9, 8].map((m, i) => (
            <div key={i} className="flex-1 bg-primary/20 rounded-full overflow-hidden h-8 flex items-end">
              <div className="w-full bg-primary/60 rounded-full" style={{ height: `${m * 10}%` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FEATURES
// ============================================================

const features = [
  {
    icon: "📓",
    title: "Smart Journal",
    description: "Rich text editor with mood tracking, tags, AI insights, and reflections. Your thoughts, organized beautifully.",
  },
  {
    icon: "✅",
    title: "Habit Tracker",
    description: "Build powerful routines with streaks, heatmaps, analytics, and custom frequencies. Never break the chain.",
  },
  {
    icon: "🎯",
    title: "Goals & Milestones",
    description: "Set quarterly, monthly, and long-term goals. Track progress with milestones and visual analytics.",
  },
  {
    icon: "💪",
    title: "Gym Tracker",
    description: "Log workouts with sets, reps, weight, RPE. Track personal records, volume, and strength progression.",
  },
  {
    icon: "📊",
    title: "Life Score",
    description: "A single score that reflects your daily performance across all areas. Track trends and breakdowns.",
  },
  {
    icon: "🧠",
    title: "AI Insights",
    description: "Get personalized daily briefings, pattern recognition, and actionable suggestions powered by AI.",
  },
  {
    icon: "📋",
    title: "Task Management",
    description: "Priorities, deadlines, categories, and focus mode. Get things done without the complexity.",
  },
  {
    icon: "💜",
    title: "Mood Tracking",
    description: "Log daily moods, emotions, and factors. Understand patterns in your mental wellbeing over time.",
  },
  {
    icon: "🏆",
    title: "Achievements",
    description: "Subtle gamification with XP, levels, and achievements. Professional motivation without the noise.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Everything you need.{" "}
            <span className="text-muted-foreground">Nothing you don&apos;t.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Replace 7+ apps with one unified experience. Designed for people who take their growth seriously.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="card-hover border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// HOW IT WORKS
// ============================================================

const steps = [
  {
    step: "01",
    title: "Sign up in seconds",
    description: "Create your free account with email or Google. No credit card required.",
  },
  {
    step: "02",
    title: "Set up your life areas",
    description: "Configure your habits, goals, and preferences. The system adapts to your lifestyle.",
  },
  {
    step: "03",
    title: "Track daily",
    description: "Log your habits, moods, workouts, and tasks. Takes less than 5 minutes a day.",
  },
  {
    step: "04",
    title: "Grow with insights",
    description: "Get AI-powered insights, track your Life Score, and watch yourself improve over time.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Simple by design.{" "}
            <span className="text-muted-foreground">Powerful by nature.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="text-5xl font-bold text-primary/20 mb-4">{step.step}</div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 w-1/2 h-[2px] bg-gradient-to-r from-primary/20 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// TESTIMONIALS
// ============================================================

const testimonials = [
  {
    name: "Alex Chen",
    role: "Software Engineer",
    avatar: "AC",
    content: "LifeOS replaced 5 different apps for me. The integration between habits, goals, and the gym tracker is incredible. My Life Score keeps me motivated every day.",
  },
  {
    name: "Sarah Mitchell",
    role: "Product Designer",
    avatar: "SM",
    content: "The journal feature with AI insights helped me understand patterns in my mood I never noticed before. The design is stunning — feels like an Apple product.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Entrepreneur",
    avatar: "MR",
    content: "Finally, one place to manage everything. The dashboard gives me a clear picture of my life in seconds. The gym tracker alone is worth it.",
  },
  {
    name: "Emily Park",
    role: "Medical Student",
    avatar: "EP",
    content: "The habit tracker with heatmaps keeps me accountable during med school. The achievement system makes the grind feel rewarding without being childish.",
  },
  {
    name: "James Wilson",
    role: "Fitness Coach",
    avatar: "JW",
    content: "The workout tracking is on par with dedicated gym apps, but having it connected to my goals and mood data gives me a complete picture of my clients' progress.",
  },
  {
    name: "Lisa Thompson",
    role: "Writer",
    avatar: "LT",
    content: "The journal system is beautiful. Rich text, mood selection, weekly reflections — it's become my daily ritual. The Life Timeline feature is like a personal biography.",
  },
];

function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Loved by{" "}
            <span className="gradient-text">thousands</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.content}</p>
                <div className="flex gap-0.5 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PRICING
// ============================================================

function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Start free.{" "}
            <span className="text-muted-foreground">Upgrade when ready.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No hidden fees. No surprises. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-border/50 relative">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-1">Free</h3>
              <p className="text-sm text-muted-foreground mb-6">Perfect to get started</p>
              <div className="text-4xl font-bold mb-6">
                $0<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Up to 3 habits",
                  "Basic journal (30 entries/mo)",
                  "Basic task management",
                  "Limited analytics",
                  "7-day mood history",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" size="lg">
                <a href="/auth/register">Get Started</a>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              Popular
            </div>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <p className="text-sm text-muted-foreground mb-6">For serious self-improvers</p>
              <div className="text-4xl font-bold mb-6">
                $9.99<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited habits",
                  "Unlimited journal entries",
                  "Advanced analytics & charts",
                  "Life Timeline",
                  "AI Insights & Daily Briefing",
                  "Full statistics hub",
                  "Workout programs",
                  "Goal milestones",
                  "Data export",
                  "Priority support",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="glow" className="w-full" size="lg">
                <a href="/auth/register">Start Free Trial</a>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                7-day free trial. Cancel anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================

const faqs = [
  {
    q: "Is LifeOS really free?",
    a: "Yes! The free plan includes essential features to get started with habits, journaling, and task management. Upgrade to Pro for unlimited access and AI features.",
  },
  {
    q: "Can I export my data?",
    a: "Absolutely. Pro users can export all their data (journal entries, habits, workouts, etc.) in JSON or CSV format at any time. Your data belongs to you.",
  },
  {
    q: "Is my data private and secure?",
    a: "We use industry-standard encryption and security practices. Your data is never sold or shared. Journal entries are encrypted at rest.",
  },
  {
    q: "Does it work on mobile?",
    a: "LifeOS is fully responsive and works beautifully on all devices — phone, tablet, and desktop. A native app is coming soon.",
  },
  {
    q: "How does the AI feature work?",
    a: "Our AI analyzes your patterns across habits, mood, goals, and workouts to provide personalized insights and daily briefings. It helps you understand trends you might miss.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel your Pro subscription at any time. You'll retain access until the end of your billing period, then revert to the free plan.",
  },
];

function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Common questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// CTA
// ============================================================

function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
          Ready to take control of your life?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join thousands of people who use LifeOS to build better habits, achieve their goals, and live more intentionally.
        </p>
        <Button size="xl" variant="glow">
          <a href="/auth/register" className="flex items-center gap-2">
            Start Free Today
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </Button>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================

function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-lg">LifeOS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your all-in-one personal operating system.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "Changelog", "Roadmap"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              {["Privacy", "Terms", "Security", "GDPR"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LifeOS. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            {["Twitter", "GitHub", "Discord"].map((social) => (
              <a key={social} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
