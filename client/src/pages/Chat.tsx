import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { getUser } from "@/lib/userContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Send, Bot, User, Phone, AlertTriangle } from "lucide-react";
import type { Message } from "@shared/schema";

function MessageBubble({ message }: { message: Message }) {
  const isBot = message.isBot;
  return (
    <div className={`flex gap-3 ${isBot ? "" : "flex-row-reverse"}`} data-testid={`message-${message.id}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isBot ? "bg-primary/15" : "bg-secondary"
      }`}>
        {isBot ? <Bot size={15} className="text-primary" /> : <User size={15} className="text-muted-foreground" />}
      </div>
      <div className={`max-w-[78%] ${isBot ? "" : "items-end flex flex-col"}`}>
        <div className={`text-xs font-medium mb-1 ${isBot ? "text-muted-foreground" : "text-right text-muted-foreground"}`}>
          {isBot ? "BridgeBot" : message.senderName}
        </div>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isBot
            ? "bg-card border border-card-border text-foreground rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        }`}>
          {message.content}
        </div>
        <div className={`text-xs text-muted-foreground mt-1 ${isBot ? "" : "text-right"}`}>
          {new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

const QUICK_PROMPTS = [
  "I'm feeling overwhelmed",
  "I can't sleep",
  "I'm really stressed about exams",
  "I feel lonely",
  "I need help with anxiety",
];

export default function Chat() {
  const [, navigate] = useLocation();
  const user = getUser();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    queryFn: () => apiRequest("GET", "/api/messages"),
    enabled: !!user,
    refetchInterval: false,
  });

  const mutation = useMutation({
    mutationFn: (content: string) =>
      apiRequest("POST", "/api/messages", { senderName: user?.name || "Student", content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setInput("");
    },
  });

  const handleSend = () => {
    if (!input.trim() || mutation.isPending) return;
    mutation.mutate(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground">Support Chat</h1>
            <p className="text-sm text-muted-foreground">BridgeBot · AI companion for mental wellness</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Online
          </div>
        </div>

        {/* Crisis banner */}
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl mb-4 shrink-0">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400 flex-1">
            In a crisis? Call <strong>988</strong> or <strong>911</strong> immediately.
          </p>
          <a href="tel:988">
            <Button size="sm" variant="destructive" className="text-xs gap-1 h-7 px-2.5" data-testid="button-crisis-call">
              <Phone size={11} /> 988
            </Button>
          </a>
        </div>

        {/* Messages */}
        <Card className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* Welcome */}
          {messages.length === 0 && !isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Bot size={15} className="text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium mb-1 text-muted-foreground">BridgeBot</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm bg-card border border-card-border text-foreground leading-relaxed">
                  Hey {user.name.split(" ")[0]}! I'm BridgeBot 💙 I'm here to listen and support you through whatever you're going through. How are you feeling today?
                </div>
              </div>
            </div>
          )}

          {messages.map((msg: Message) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {mutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Bot size={15} className="text-primary" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-card-border">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </Card>

        {/* Quick prompts */}
        <div className="flex gap-2 overflow-x-auto py-2 shrink-0 no-scrollbar">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="shrink-0 text-xs px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary border border-border rounded-full transition-colors whitespace-nowrap"
              data-testid={`prompt-${prompt.substring(0, 10)}`}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 shrink-0 pt-1">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what's on your mind..."
            disabled={mutation.isPending}
            className="flex-1"
            data-testid="input-message"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || mutation.isPending}
            className="shrink-0 gap-1.5"
            data-testid="button-send-message"
          >
            <Send size={15} />
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center py-2 shrink-0">
          BridgeBot is an AI support companion, not a licensed therapist. For clinical help, use the Resources section.
        </p>
      </div>
    </Layout>
  );
}
