import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getUser } from "@/lib/userContext";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Phone, ExternalLink, Search, Filter } from "lucide-react";
import type { Resource } from "@shared/schema";

const typeConfig = {
  emergency: { label: "Emergency", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200" },
  counselor: { label: "Counselor", color: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 border-violet-200" },
  peer: { label: "Peer Support", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200" },
  "self-help": { label: "Self-Help", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200" },
};

const levelConfig = {
  GREEN: { dot: "bg-green-500", label: "Stable" },
  YELLOW: { dot: "bg-yellow-500", label: "At Risk" },
  RED: { dot: "bg-red-500", label: "Crisis" },
  ALL: { dot: "bg-gray-400", label: "All Levels" },
};

const filters = ["all", "emergency", "counselor", "peer", "self-help"];

export default function Resources() {
  const [, navigate] = useLocation();
  const user = getUser();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
    queryFn: () => apiRequest("GET", "/api/resources"),
    enabled: !!user,
  });

  const filtered = resources.filter((r: Resource) => {
    const matchesSearch = search === "" ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || r.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Sort: emergency first
  const sorted = [...filtered].sort((a, b) => {
    const order = { emergency: 0, counselor: 1, peer: 2, "self-help": 3 };
    return (order[a.type as keyof typeof order] || 3) - (order[b.type as keyof typeof order] || 3);
  });

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mental Health Resources</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Curated support options matched to every need level</p>
        </div>

        {/* Emergency banner */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">In immediate danger?</p>
              <p className="text-xs text-red-600 dark:text-red-500">Call <strong>988</strong> (Suicide & Crisis Lifeline) or <strong>911</strong> (Emergency Services) right now.</p>
            </div>
            <a href="tel:988" className="shrink-0">
              <Button variant="destructive" size="sm" className="gap-1.5" data-testid="button-emergency-988">
                <Phone size={13} /> 988
              </Button>
            </a>
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-resources"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <Button
                key={f}
                variant={activeFilter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(f)}
                className="capitalize text-xs"
                data-testid={`filter-${f}`}
              >
                {f === "self-help" ? "Self-Help" : f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-muted-foreground">
          Showing {sorted.length} resource{sorted.length !== 1 ? "s" : ""}
        </p>

        {/* Resource list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No resources found for your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((resource: Resource) => {
              const tCfg = typeConfig[resource.type as keyof typeof typeConfig] || typeConfig["self-help"];
              const lCfg = levelConfig[resource.level as keyof typeof levelConfig] || levelConfig.ALL;
              return (
                <Card key={resource.id} className="hover:shadow-md transition-shadow" data-testid={`card-resource-${resource.id}`}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge className={`${tCfg.color} border text-xs`}>{tCfg.label}</Badge>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${lCfg.dot}`} />
                            <span className="text-xs text-muted-foreground">{lCfg.label}</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 items-end">
                        {resource.phone && (
                          <a href={`tel:${resource.phone}`}>
                            <Button variant="outline" size="sm" className="gap-1.5 text-xs" data-testid={`button-call-${resource.id}`}>
                              <Phone size={12} /> {resource.phone}
                            </Button>
                          </a>
                        )}
                        {resource.url && (
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary" data-testid={`button-visit-${resource.id}`}>
                              <ExternalLink size={12} /> Visit Site
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* SDG note */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            MindBridge resource curation supports <strong>UN SDG 3</strong> (Good Health & Well-Being) and <strong>SDG 4</strong> (Quality Education).
          </p>
        </div>
      </div>
    </Layout>
  );
}
