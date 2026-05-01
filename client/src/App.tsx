import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Checkin from "@/pages/Checkin";
import Results from "@/pages/Results";
import Resources from "@/pages/Resources";
import Chat from "@/pages/Chat";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/register" component={Register} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/checkin" component={Checkin} />
          <Route path="/results" component={Results} />
          <Route path="/resources" component={Resources} />
          <Route path="/chat" component={Chat} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}
