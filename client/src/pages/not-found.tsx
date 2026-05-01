import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-black text-muted-foreground/30 mb-4">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-6">This page doesn't exist.</p>
        <Button onClick={() => navigate("/")} className="gap-2">
          <Home size={16} /> Go Home
        </Button>
      </div>
    </div>
  );
}
