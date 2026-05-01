import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/userContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Moon, Zap, Heart, Brain, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import type { Checkin } from "@shared/schema";

function TriageBadge({ level }: { level: string }) {
  const configs = {
    GREEN: { cls: "bg-green-100 text-green-700 border-green-200", label: "Stable" },
    YELLOW: { cls: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "At Risk" },
    RED: { cls: "bg-red-100 text-red-700 border-red-200", label: "Crisis Support" },
  };
  const c = configs[level as keyof typeof configs] || configs.GREEN;
  return <Badge className={`${c.cls} border font-medium`}>{c.label}</Badge>;
}

function MoodBar({ value, max = 10, color = "bg-primary" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const user = getUser();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats/user", user?.id],
    queryFn: () => apiRequest("GET", `/api/stats/user/${user?.id}`),
    enabled: !!user?.id,
  });

  const { data: checkins } = useQuery({
    queryKey: ["/api/checkins/user", user?.id],
    queryFn: () => apiRequest("GET", `/api/checkins/user/${user?.id}`),
    enabled: !!user?.id,
  });

  if (!user) return null;

  const latestCheckin: Checkin | undefined = checkins?.[0];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const TrendIcon = stats?.trend === "improving" ? TrendingUp : stats?.trend === "declining" ? TrendingDown : Minus;
  const trendColor = stats?.trend === "improving" ? "text-green-600" : stats?.trend === "declining" ? "text-red-500" : "text-muted-foreground";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{greeting()}, {user.name.split(" ")[0]} 👋</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{user.university} · {user.year}</p>
          </div>
          <Button onClick={() => navigate("/checkin")} className="gap-2 shrink-0" data-testid="button-daily-checkin">
            Daily Check-In <ArrowRight size={16} />
          </Button>
        </div>

        {/* Latest triage status */}
        {latestCheckin && (
          <Card className="border-l-4" style={{
            borderLeftColor: latestCheckin.triageLevel === "RED" ? "#ef4444" : latestCheckin.triageLevel === "YELLOW" ? "#eab308" : "#22c55e"
          }}>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Latest status</span>
                    <TriageBadge level={latestCheckin.triageLevel} />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{latestCheckin.aiInsight}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(latestCheckin.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/resources")} data-testid="button-view-resources">
                  Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!latestCheckin && (
          <Card className="border-dashed">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Brain size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No check-ins yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">Complete your first daily check-in to get your personalized wellness analysis.</p>
              <Button onClick={() => navigate("/checkin")} data-testid="button-first-checkin">Start First Check-In</Button>
            </CardContent>
          </Card>
        )}

        {/* Stats grid */}
        {stats?.hasData && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Avg Mood", value: `${stats.avgMood}/10`, icon: Heart, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", bar: stats.avgMood, barColor: "bg-rose-400" },
                { label: "Avg Energy", value: `${stats.avgEnergy}/10`, icon: Zap, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", bar: stats.avgEnergy, barColor: "bg-amber-400" },
                { label: "Avg Stress", value: `${stats.avgStress}/10`, icon: Brain, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30", bar: 10 - stats.avgStress, barColor: "bg-violet-400" },
                { label: "Avg Sleep", value: `${stats.avgSleep}h`, icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30", bar: Math.min(stats.avgSleep, 10), barColor: "bg-indigo-400" },
              ].map(({ label, value, icon: Icon, color, bg, bar, barColor }) => (
                <Card key={label}>
                  <CardContent className="pt-4 pb-4">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="text-xl font-bold text-foreground">{value}</div>
                    <div className="text-xs text-muted-foreground mb-2">{label}</div>
                    <MoodBar value={bar} color={barColor} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Triage breakdown + trend */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">7-Day Triage Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { level: "GREEN", label: "Stable", count: stats.triageCounts.GREEN, color: "bg-green-500" },
                      { level: "YELLOW", label: "At Risk", count: stats.triageCounts.YELLOW, color: "bg-yellow-500" },
                      { level: "RED", label: "Crisis", count: stats.triageCounts.RED, color: "bg-red-500" },
                    ].map(({ level, label, count, color }) => (
                      <div key={level} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${color} shrink-0`} />
                        <span className="text-sm text-muted-foreground w-20">{label}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${(count / 7) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium text-foreground w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Wellness Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <TrendIcon size={28} className={trendColor} />
                    <div>
                      <div className="font-semibold text-foreground capitalize">{stats.trend}</div>
                      <div className="text-xs text-muted-foreground">Based on recent check-ins</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total check-ins: <span className="font-medium text-foreground">{stats.totalCheckins}</span>
                  </div>
                  {stats.trend === "declining" && (
                    <div className="mt-3 p-2.5 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">Your mood has been declining. Consider booking a counselor session.</p>
                    </div>
                  )}
                  {stats.trend === "improving" && (
                    <div className="mt-3 p-2.5 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-700 dark:text-green-400">Your mood is improving. Keep up the great work!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent check-ins */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recent Check-Ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(checkins as Checkin[] || []).slice(0, 5).map((c: Checkin) => (
                    <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0" data-testid={`row-checkin-${c.id}`}>
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        c.triageLevel === "RED" ? "bg-red-500" : c.triageLevel === "YELLOW" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">Mood {c.mood}/10</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">Stress {c.stress}/10</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">{c.sleep}h sleep</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Check-In", icon: Calendar, href: "/checkin" },
            { label: "Resources", icon: Brain, href: "/resources" },
            { label: "Peer Chat", icon: Heart, href: "/chat" },
            { label: "Support", icon: Zap, href: "/chat" },
          ].map(({ label, icon: Icon, href }) => (
            <Button key={label} variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate(href)} data-testid={`button-quick-${label.toLowerCase()}`}>
              <Icon size={18} className="text-primary" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
