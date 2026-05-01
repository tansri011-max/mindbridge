import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getUser, setLastCheckinResult } from "@/lib/userContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Loader2, Moon, Zap, Heart, Brain } from "lucide-react";

interface SliderFieldProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  lowLabel: string;
  highLabel: string;
  colorClass: string;
  testId: string;
}

function SliderField({ label, icon, value, onChange, min, max, step = 1, lowLabel, highLabel, colorClass, testId }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className={`text-lg font-bold ${colorClass}`}>
          {step < 1 ? value.toFixed(1) : value}
          {step >= 1 ? "/10" : "h"}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}%)`
        }}
        data-testid={testId}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

function MoodFaceSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const faces = [
    { v: 1, emoji: "😞", label: "Very Bad" },
    { v: 2, emoji: "😔", label: "Bad" },
    { v: 3, emoji: "😕", label: "Not Great" },
    { v: 4, emoji: "😐", label: "Okay" },
    { v: 5, emoji: "🙂", label: "Fine" },
    { v: 6, emoji: "😊", label: "Good" },
    { v: 7, emoji: "😄", label: "Pretty Good" },
    { v: 8, emoji: "😃", label: "Great" },
    { v: 9, emoji: "😁", label: "Excellent" },
    { v: 10, emoji: "🤩", label: "Amazing!" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-rose-500" />
          <span className="text-sm font-medium text-foreground">Overall Mood</span>
        </div>
        <span className="text-lg font-bold text-rose-500">{value}/10</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {faces.map(({ v, emoji, label }) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all text-xs ${
              value === v
                ? "border-primary bg-primary/10 scale-105"
                : "border-border hover:border-primary/40 hover:bg-muted/50"
            }`}
            title={label}
            data-testid={`mood-${v}`}
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>{v}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {faces.find(f => f.v === value)?.label}
      </p>
    </div>
  );
}

export default function Checkin() {
  const [, navigate] = useLocation();
  const user = getUser();
  const { toast } = useToast();

  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(6);
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(7.0);
  const [note, setNote] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/checkins", data),
    onSuccess: (result) => {
      setLastCheckinResult(result);
      queryClient.invalidateQueries({ queryKey: ["/api/checkins/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      navigate("/results");
    },
    onError: () => {
      toast({ title: "Check-in failed", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!user) return;
    mutation.mutate({ userId: user.id, mood, energy, stress, sleep, note: note || undefined });
  };

  const steps = [
    { title: "How are you feeling?", desc: "Tap the emoji that best matches your mood right now" },
    { title: "Energy & Stress", desc: "Rate your energy levels and current stress" },
    { title: "Sleep & Notes", desc: "How much did you sleep? Any thoughts to share?" },
  ];

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold text-foreground">Daily Check-In</h1>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{steps[step - 1].title}</CardTitle>
            <CardDescription>{steps[step - 1].desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <MoodFaceSelector value={mood} onChange={setMood} />
            )}

            {step === 2 && (
              <div className="space-y-6">
                <SliderField
                  label="Energy Level"
                  icon={<Zap size={18} className="text-amber-500" />}
                  value={energy}
                  onChange={setEnergy}
                  min={1} max={10}
                  lowLabel="Exhausted"
                  highLabel="Energized"
                  colorClass="text-amber-500"
                  testId="slider-energy"
                />
                <SliderField
                  label="Stress Level"
                  icon={<Brain size={18} className="text-violet-500" />}
                  value={stress}
                  onChange={setStress}
                  min={1} max={10}
                  lowLabel="Very calm"
                  highLabel="Very stressed"
                  colorClass="text-violet-500"
                  testId="slider-stress"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <SliderField
                  label="Sleep Last Night"
                  icon={<Moon size={18} className="text-indigo-500" />}
                  value={sleep}
                  onChange={setSleep}
                  min={0} max={12} step={0.5}
                  lowLabel="0 hours"
                  highLabel="12 hours"
                  colorClass="text-indigo-500"
                  testId="slider-sleep"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Anything you'd like to share? <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <Textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="What's on your mind today? Any specific worries, wins, or thoughts..."
                    className="resize-none"
                    rows={4}
                    data-testid="textarea-note"
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1" data-testid="button-back">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="flex-1" data-testid="button-next">
                  Continue
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={mutation.isPending} className="flex-1 gap-2" data-testid="button-submit-checkin">
                  {mutation.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                  ) : (
                    "Get My Results"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Privacy notice */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Your responses are private and confidential. Analysis runs securely on our servers.
        </p>
      </div>
    </Layout>
  );
}
