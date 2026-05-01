import { useLocation } from "wouter";
import { useEffect } from "react";
import { getUser, getLastCheckinResult } from "@/lib/userContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Phone, ExternalLink, MessageCircle, LayoutDashboard, CheckCircle } from "lucide-react";
import type { Resource } from "@shared/schema";

const triageConfig = {
  GREEN: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    dotColor: "bg-green-500",
    label: "Stable & Thriving",
    emoji: "🌿",
    message: "You're doing well today. Keep up the healthy habits — consistent check-ins and self-care are your best tools.",
  },
  YELLOW: {
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    dotColor: "bg-yellow-500",
    label: "Early Warning Detected",
    emoji: "⚡",
    message: "Our AI detected some stress signals. This is early — a great time to use the resources below and consider talking to someone.",
  },
  RED: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
    label: "Crisis Support Recommended",
    emoji: "💙",
    message: "You're going through something really hard right now. Please reach out — you deserve immediate, real support. The resources below can help right now.",
  },
};

const typeConfig = {
  emergency: { label: "Emergency", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200" },
  counselor: { label: "Counselor", color: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 border-violet-200" },
  peer: { label: "Peer Support", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200" },
  "self-help": { label: "Self-Help", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200" },
};

export default function Results() {
  const [, navigate] = useLocation();
  const user = getUser();
  const result = getLastCheckinResult();

  useEffect(() => {
    if (!user) navigate("/");
    if (!result) navigate("/checkin");
  }, [user, result]);

  if (!result || !user) return null;

  const { checkin, resources, score } = result;
  const cfg = triageConfig[checkin.triageLevel as keyof typeof triageConfig] || triageConfig.GREEN;

  // Sort resources: emergency first for RED, then by relevance
  const sortedResources: Resource[] = [...(resources || [])].sort((a: Resource, b: Resource) => {
    if (checkin.triageLevel === "RED") {
      if (a.type === "emergency" && b.type !== "emergency") return -1;
      if (b.type === "emergency" && a.type !== "emergency") return 1;
    }
    const order = { emergency: 0, counselor: 1, peer: 2, "self-help": 3 };
    return (order[a.type as keyof typeof order] || 3) - (order[b.type as keyof typeof order] || 3);
  }).slice(0, 6);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Result card */}
        <Card className={`${cfg.bgColor} border-2 ${cfg.borderColor}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{cfg.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${cfg.dotColor}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${cfg.color}`}>
                    {checkin.triageLevel} Status
                  </span>
                </div>
                <h2 className={`text-xl font-bold mb-2 ${cfg.color}`}>{cfg.label}</h2>
                <p className="text-sm text-foreground leading-relaxed mb-3">{checkin.aiInsight}</p>
                <p className="text-xs text-muted-foreground">{cfg.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Your Check-In Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Mood", value: `${checkin.mood}/10`, emoji: "😊" },
                { label: "Energy", value: `${checkin.energy}/10`, emoji: "⚡" },
                { label: "Stress", value: `${checkin.stress}/10`, emoji: "🧠" },
                { label: "Sleep", value: `${checkin.sleep}h`, emoji: "🌙" },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="text-center py-3 px-2 bg-muted/50 rounded-xl">
                  <div className="text-2xl mb-1">{emoji}</div>
                  <div className="text-lg font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            {checkin.note && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Your note</p>
                <p className="text-sm text-foreground italic">"{checkin.note}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resources */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Recommended Support for You</h3>
          <div className="space-y-3">
            {sortedResources.map((resource: Resource) => {
              const tCfg = typeConfig[resource.type as keyof typeof typeConfig] || typeConfig["self-help"];
              return (
                <Card key={resource.id} className="hover:shadow-sm transition-shadow" data-testid={`card-resource-${resource.id}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${tCfg.color} border text-xs`}>{tCfg.label}</Badge>
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mb-1">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{resource.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {resource.phone && (
                          <a href={`tel:${resource.phone}`} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                            <Phone size={13} /> {resource.phone}
                          </a>
                        )}
                        {resource.url && (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                            <ExternalLink size={13} /> Visit
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Ethics note */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-2">
              <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">About this analysis:</strong> MindBridge uses a transparent, rule-based triage system — not a medical diagnosis. This tool is designed to support, not replace, professional mental health care. If you are in immediate danger, please call emergency services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-col gap-1.5 h-auto py-3" data-testid="button-go-dashboard">
            <LayoutDashboard size={18} className="text-primary" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button variant="outline" onClick={() => navigate("/chat")} className="flex-col gap-1.5 h-auto py-3" data-testid="button-go-chat">
            <MessageCircle size={18} className="text-primary" />
            <span className="text-xs">Talk to Bot</span>
          </Button>
          <Button onClick={() => navigate("/checkin")} className="flex-col gap-1.5 h-auto py-3" data-testid="button-new-checkin">
            <ArrowRight size={18} />
            <span className="text-xs">Check In Again</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
