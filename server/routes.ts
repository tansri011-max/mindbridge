import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCheckinSchema, insertMessageSchema } from "@shared/schema";

// AI Triage Engine — rule-based (no external API needed, fully offline)
function computeTriage(mood: number, energy: number, stress: number, sleep: number): {
  level: "GREEN" | "YELLOW" | "RED";
  score: number;
  insight: string;
} {
  // Normalize all metrics to 0-100 scale (higher = worse)
  const moodScore = (10 - mood) * 10;        // low mood = high risk
  const energyScore = (10 - energy) * 10;     // low energy = high risk
  const stressScore = stress * 10;             // high stress = high risk
  const sleepScore = sleep < 5 ? 80 : sleep < 6 ? 50 : sleep < 7 ? 20 : 0;

  const composite = (moodScore * 0.3 + energyScore * 0.2 + stressScore * 0.3 + sleepScore * 0.2);

  let level: "GREEN" | "YELLOW" | "RED";
  let insight: string;

  if (composite >= 65) {
    level = "RED";
    if (stress >= 8 && mood <= 3) {
      insight = "You're showing signs of acute distress — high stress and low mood together can be overwhelming. Please reach out to a counselor or crisis line today. You are not alone.";
    } else if (sleep < 5) {
      insight = "Severe sleep deprivation is compounding your mental health. This level of exhaustion affects judgment and emotional regulation. Immediate support is recommended.";
    } else {
      insight = "Your responses indicate significant emotional strain across multiple dimensions. Please connect with a mental health professional as soon as possible.";
    }
  } else if (composite >= 35) {
    level = "YELLOW";
    if (stress >= 7) {
      insight = "Your stress levels are elevated. Try a 5-minute breathing exercise and consider scheduling a counselor appointment this week. Talking to a peer supporter could also help.";
    } else if (sleep < 6) {
      insight = "Sleep deprivation is affecting your wellbeing. Prioritizing even one extra hour of sleep can noticeably improve mood and focus. Consider our sleep hygiene resources.";
    } else if (energy <= 4) {
      insight = "Low energy combined with moderate stress suggests you may be approaching burnout. Consider lightening your schedule and using campus mental health resources.";
    } else {
      insight = "You're managing, but showing some strain. This is a good time to build in recovery — peer support, light exercise, or a counselor chat can prevent things from escalating.";
    }
  } else {
    level = "GREEN";
    if (mood >= 8 && stress <= 3) {
      insight = "You're doing great! Your emotional balance is strong today. Keep maintaining your sleep and social connections — they're your best protection against future stress.";
    } else if (sleep >= 8) {
      insight = "Good sleep is your superpower. You're in a healthy range today. Stay connected with your campus community and check in again tomorrow.";
    } else {
      insight = "You're in a stable zone. Minor stressors are normal — you're handling them well. Keep using positive coping strategies and stay connected with peers.";
    }
  }

  return { level, score: Math.round(composite), insight };
}

// Simple AI support bot responses
function getBotResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("suicide") || msg.includes("kill myself") || msg.includes("end my life")) {
    return "🚨 I'm really glad you're talking to me right now. What you're feeling matters. Please call or text 988 (Suicide & Crisis Lifeline) right now — they're available 24/7 and can help. If you're in immediate danger, please call 911.";
  }
  if (msg.includes("can't sleep") || msg.includes("insomnia")) {
    return "Sleep struggles are really common during high-stress periods. Try the 4-7-8 technique: inhale for 4 seconds, hold for 7, exhale for 8. Doing this 3 times can calm your nervous system. Also, our resource section has a free sleep guide!";
  }
  if (msg.includes("anxious") || msg.includes("anxiety") || msg.includes("panic")) {
    return "Anxiety can feel really intense. Let's ground you: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. This 5-4-3-2-1 technique interrupts the anxiety cycle. How are you feeling now?";
  }
  if (msg.includes("overwhelmed") || msg.includes("too much") || msg.includes("can't handle")) {
    return "It sounds like you're carrying a lot right now. That's exhausting. Can you identify just ONE thing that, if handled, would make today feel more manageable? Sometimes breaking it down is all we need to start.";
  }
  if (msg.includes("lonely") || msg.includes("alone") || msg.includes("no friends")) {
    return "Loneliness in college is more common than people admit — everyone looks connected on the outside. Our Peer Support Circle connects you with students who truly understand. Would you like me to show you how to join?";
  }
  if (msg.includes("stressed") || msg.includes("stress") || msg.includes("exams") || msg.includes("deadline")) {
    return "Academic stress is real and valid. Try the Pomodoro technique: 25 minutes focused work, 5 minute break. It makes big tasks feel manageable. Also — have you done your check-in today? It can help you track what's driving the stress.";
  }
  if (msg.includes("depressed") || msg.includes("depression") || msg.includes("hopeless")) {
    return "Thank you for sharing that with me. Depression can make everything feel heavier. You deserve real support — our campus counseling center offers free sessions, and 7 Cups has listeners available right now. Would you like those links?";
  }
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey")) {
    return "Hey! I'm BridgeBot, your MindBridge companion. I'm here to listen and support you. How are you feeling today? You can also do a quick check-in from the home page anytime.";
  }
  if (msg.includes("thank")) {
    return "You're so welcome. Reaching out takes courage. Remember — you're not alone in this, and checking in regularly is one of the best things you can do for your mental health. 💙";
  }
  if (msg.includes("help") || msg.includes("what can you do")) {
    return "I'm here to listen, offer coping strategies, and point you toward the right support. You can: do a daily mood check-in, browse curated resources, or just talk here. What do you need most right now?";
  }
  
  // Default supportive response
  const responses = [
    "I hear you. What you're going through matters, and you're not alone. Can you tell me a bit more about what's been going on?",
    "Thank you for sharing that. It takes strength to talk about these things. What's weighing on you most right now?",
    "I'm here with you. Sometimes just putting things into words helps. Would you like to try a quick breathing exercise, or would you rather keep talking?",
    "That sounds really tough. You're handling a lot. Remember — small steps count. Have you tried our daily check-in? It can help identify patterns in how you're feeling.",
    "I appreciate you trusting me with this. Your feelings are completely valid. Is there a specific kind of support you're looking for — someone to talk to, resources, or coping strategies?",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  
  // User registration
  app.post("/api/users/register", (req, res) => {
    const parsed = insertUserSchema.safeParse({
      ...req.body,
      createdAt: new Date().toISOString(),
    });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    
    const existing = storage.getUserByEmail(parsed.data.email);
    if (existing) return res.status(409).json({ error: "Email already registered" });
    
    const user = storage.createUser(parsed.data);
    return res.json(user);
  });

  // User login (simple — no auth library for demo)
  app.post("/api/users/login", (req, res) => {
    const { email } = req.body;
    const user = storage.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  });

  // Get user
  app.get("/api/users/:id", (req, res) => {
    const user = storage.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  });

  // Create check-in with AI triage
  app.post("/api/checkins", (req, res) => {
    const { userId, mood, energy, stress, sleep, note } = req.body;
    
    if (!userId || !mood || !energy || !stress || !sleep) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { level, score, insight } = computeTriage(
      Number(mood), Number(energy), Number(stress), Number(sleep)
    );

    const checkin = storage.createCheckin({
      userId: Number(userId),
      mood: Number(mood),
      energy: Number(energy),
      stress: Number(stress),
      sleep: Number(sleep),
      note: note || null,
      triageLevel: level,
      aiInsight: insight,
      createdAt: new Date().toISOString(),
    });

    // Get recommended resources
    const resources = storage.getResourcesByLevel(level);
    const allResources = storage.getResourcesByLevel("ALL");

    return res.json({ checkin, resources: [...resources, ...allResources], score });
  });

  // Get check-ins for user
  app.get("/api/checkins/user/:userId", (req, res) => {
    const checkins = storage.getCheckinsByUser(Number(req.params.userId));
    return res.json(checkins);
  });

  // Get all resources
  app.get("/api/resources", (req, res) => {
    const { level } = req.query;
    if (level && typeof level === "string") {
      return res.json(storage.getResourcesByLevel(level));
    }
    return res.json(storage.getAllResources());
  });

  // Send message (support chat)
  app.post("/api/messages", (req, res) => {
    const { senderName, content } = req.body;
    if (!senderName || !content) {
      return res.status(400).json({ error: "Missing senderName or content" });
    }

    // Save user message
    const userMsg = storage.createMessage({
      senderName,
      content,
      isBot: false,
      createdAt: new Date().toISOString(),
    });

    // Generate and save bot response
    const botReply = getBotResponse(content);
    const botMsg = storage.createMessage({
      senderName: "BridgeBot",
      content: botReply,
      isBot: true,
      createdAt: new Date(Date.now() + 100).toISOString(),
    });

    return res.json({ userMsg, botMsg });
  });

  // Get recent messages
  app.get("/api/messages", (req, res) => {
    const messages = storage.getRecentMessages(50);
    return res.json(messages.reverse()); // oldest first
  });

  // Dashboard stats
  app.get("/api/stats/user/:userId", (req, res) => {
    const checkins = storage.getCheckinsByUser(Number(req.params.userId), 30);
    if (checkins.length === 0) return res.json({ hasData: false });

    const recent = checkins.slice(0, 7);
    const avgMood = recent.reduce((s, c) => s + c.mood, 0) / recent.length;
    const avgStress = recent.reduce((s, c) => s + c.stress, 0) / recent.length;
    const avgSleep = recent.reduce((s, c) => s + c.sleep, 0) / recent.length;
    const avgEnergy = recent.reduce((s, c) => s + c.energy, 0) / recent.length;

    const triageCounts = { GREEN: 0, YELLOW: 0, RED: 0 };
    recent.forEach(c => { triageCounts[c.triageLevel as keyof typeof triageCounts]++; });

    const trend = checkins.length >= 2
      ? checkins[0].mood > checkins[1].mood ? "improving"
      : checkins[0].mood < checkins[1].mood ? "declining"
      : "stable"
      : "stable";

    return res.json({
      hasData: true,
      avgMood: Math.round(avgMood * 10) / 10,
      avgStress: Math.round(avgStress * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      triageCounts,
      trend,
      totalCheckins: checkins.length,
      history: checkins.slice(0, 14).reverse(),
    });
  });

  return httpServer;
}
