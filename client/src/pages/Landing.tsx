import { useLocation } from "wouter";
import { ArrowRight, Brain, Shield, Users, TrendingUp, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUser } from "@/lib/userContext";

export default function Landing() {
  const [, navigate] = useLocation();
  const user = getUser();

  if (user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-label="MindBridge" className="shrink-0">
            <rect width="24" height="24" rx="8" fill="hsl(262 60% 55%)" />
            <path d="M12 18c-4.2-4.2-7-7.5-7-9.8C5 5.9 6.8 5 8.3 5c.9 0 2.8.4 3.7 3.1C12.9 5.4 14.8 5 15.7 5c1.7 0 3.3 1.1 3.3 3.2 0 2.3-2.8 5.6-7 9.8z" fill="white"/>
          </svg>
          <span className="font-bold text-lg text-foreground">MindBridge</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/register")} data-testid="button-login">
            Sign In
          </Button>
          <Button size="sm" onClick={() => navigate("/register")} data-testid="button-get-started">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-5xl mx-auto text-center">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 font-medium px-4 py-1.5" data-testid="badge-sdg">
          SDG 3 · SDG 4 · Student Mental Health
        </Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6">
          Your mental health matters.{" "}
          <span className="text-primary">Let's check in.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          MindBridge uses AI triage to detect early signs of student burnout and emotional distress — 
          then instantly connects you to the right level of support before a crisis happens.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="text-base px-8 py-3 h-auto gap-2" onClick={() => navigate("/register")} data-testid="button-start-free">
            Start Free Check-In <ArrowRight size={18} />
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8 py-3 h-auto" onClick={() => {
            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
          }}>
            See How It Works
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-5">Free for all students · No credit card · 100% confidential</p>
      </section>

      {/* Stats banner */}
      <section className="bg-primary/5 border-y border-primary/10 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: "1 in 3", label: "students experience anxiety" },
            { stat: "40%", label: "never seek help" },
            { stat: "Early detection", label: "reduces crisis risk by 60%" },
            { stat: "24/7", label: "support, always available" },
          ].map(({ stat, label }) => (
            <div key={stat} className="space-y-1">
              <div className="text-2xl md:text-3xl font-bold text-primary">{stat}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground mb-3">How MindBridge Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Three simple steps. Built with care for real students.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              icon: ClipboardCheckIcon,
              title: "Daily 2-Minute Check-In",
              desc: "Answer 4 simple questions about your mood, energy, stress, and sleep. No judgment, just data."
            },
            {
              step: "02",
              icon: BrainIcon,
              title: "AI Triage Analysis",
              desc: "Our algorithm instantly assesses your emotional state and classifies your risk level: GREEN, YELLOW, or RED."
            },
            {
              step: "03",
              icon: SupportIcon,
              title: "Personalized Support",
              desc: "Get matched to the right resources — peer support, campus counselors, or emergency services."
            }
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative bg-card border border-card-border rounded-2xl p-6">
              <div className="text-5xl font-black text-primary/10 absolute top-4 right-4">{step}</div>
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Triage levels */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">The Triage System</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Transparent, explainable AI — no black boxes.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-green-500 shrink-0" />
              <span className="font-bold text-green-700 dark:text-green-400 text-lg">GREEN</span>
            </div>
            <p className="text-sm text-green-800 dark:text-green-300 mb-3 font-medium">Stable & Thriving</p>
            <p className="text-sm text-muted-foreground">You're in a good space. We'll still provide self-care tips, mindfulness resources, and peer community access.</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-yellow-500 shrink-0" />
              <span className="font-bold text-yellow-700 dark:text-yellow-400 text-lg">YELLOW</span>
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3 font-medium">At Risk — Early Warning</p>
            <p className="text-sm text-muted-foreground">Stress or burnout signals detected. We'll connect you with peer supporters and suggest a counselor appointment.</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-red-500 shrink-0" />
              <span className="font-bold text-red-700 dark:text-red-400 text-lg">RED</span>
            </div>
            <p className="text-sm text-red-800 dark:text-red-300 mb-3 font-medium">Crisis — Immediate Support</p>
            <p className="text-sm text-muted-foreground">Significant distress detected. Emergency resources, crisis hotlines, and immediate counselor contacts are provided.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Built for Students, By Design</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Every feature is evidence-based and student-centered.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "100% Confidential", desc: "Your data never leaves the platform without your consent. Privacy by default." },
              { icon: Brain, title: "Explainable AI", desc: "You always see why you received a triage level. No algorithmic black boxes." },
              { icon: TrendingUp, title: "Trend Tracking", desc: "See your mood, sleep, and stress trends over time with a visual dashboard." },
              { icon: Users, title: "Peer Support Circle", desc: "Chat with trained student peer supporters who truly understand academic pressure." },
              { icon: CheckCircle, title: "Curated Resources", desc: "Evidence-based resources matched to your specific triage level and needs." },
              { icon: Star, title: "SDG-Aligned", desc: "Supporting UN SDG 3 (Good Health) and SDG 4 (Quality Education) for all students." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={17} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm mb-1">{title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to take care of yourself?</h2>
        <p className="text-muted-foreground mb-8">Join thousands of students who check in daily. It takes 2 minutes.</p>
        <Button size="lg" className="text-base px-10 py-3 h-auto gap-2" onClick={() => navigate("/register")} data-testid="button-cta-bottom">
          Start Your First Check-In <ArrowRight size={18} />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="6" fill="hsl(262 60% 55%)" />
              <path d="M12 18c-4.2-4.2-7-7.5-7-9.8C5 5.9 6.8 5 8.3 5c.9 0 2.8.4 3.7 3.1C12.9 5.4 14.8 5 15.7 5c1.7 0 3.3 1.1 3.3 3.2 0 2.3-2.8 5.6-7 9.8z" fill="white"/>
            </svg>
            <span>MindBridge · Nexora Innovation Summit 2026</span>
          </div>
          <div>Built with care · SDG 3 & 4 · For every student</div>
        </div>
      </footer>
    </div>
  );
}

function ClipboardCheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(262 60% 55%)" strokeWidth="2"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>;
}
function BrainIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(262 60% 55%)" strokeWidth="2"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/></svg>;
}
function SupportIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(262 60% 55%)" strokeWidth="2"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>;
}
