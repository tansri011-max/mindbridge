import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and, gte } from "drizzle-orm";
import * as schema from "@shared/schema";
import { type User, type InsertUser, type Checkin, type InsertCheckin, type Resource, type Message, type InsertMessage } from "@shared/schema";

const sqlite = new Database("data.db");
export const db = drizzle(sqlite, { schema });

// Initialize tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    university TEXT NOT NULL,
    year TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mood INTEGER NOT NULL,
    energy INTEGER NOT NULL,
    stress INTEGER NOT NULL,
    sleep REAL NOT NULL,
    note TEXT,
    triage_level TEXT NOT NULL,
    ai_insight TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT,
    phone TEXT,
    level TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_bot INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

// Seed resources if empty
const resourceCount = sqlite.prepare("SELECT COUNT(*) as count FROM resources").get() as { count: number };
if (resourceCount.count === 0) {
  const seed = sqlite.prepare(`INSERT INTO resources (title, description, type, url, phone, level) VALUES (?, ?, ?, ?, ?, ?)`);
  const resources = [
    ["University Counseling Center", "Professional mental health counselors available Mon-Fri, 9am-5pm. Free for enrolled students.", "counselor", "https://example.edu/counseling", "1-800-555-0100", "YELLOW"],
    ["Crisis Text Line", "Text HOME to 741741. Free, 24/7, confidential crisis counseling via text.", "emergency", "https://crisistextline.org", "741741", "RED"],
    ["National Suicide Prevention Lifeline", "Call or text 988 to reach a counselor 24/7. Immediate crisis support.", "emergency", "https://988lifeline.org", "988", "RED"],
    ["MindBridge Peer Support Circle", "Connect with trained student peer supporters who understand academic pressure.", "peer", null, null, "GREEN"],
    ["Calm App — Student Plan", "Guided meditations, sleep stories, and breathing exercises. Free for students.", "self-help", "https://calm.com/students", null, "GREEN"],
    ["Headspace for Students", "Mindfulness and meditation resources tailored for academic stress.", "self-help", "https://headspace.com/students", null, "GREEN"],
    ["7 Cups — Online Therapy", "Free emotional support from trained listeners, 24/7. Upgrade for licensed therapists.", "peer", "https://7cups.com", null, "YELLOW"],
    ["SAM — Self-help for Anxiety", "Evidence-based app for managing anxiety with CBT techniques.", "self-help", "https://sam-app.org.uk", null, "YELLOW"],
    ["Student Assistance Program", "24/7 confidential hotline for students facing mental health, substance, or personal crises.", "counselor", null, "1-800-555-0199", "YELLOW"],
    ["Active Minds Campus Chapter", "Student-run mental health advocacy and peer support community on campus.", "peer", "https://activeminds.org", null, "GREEN"],
    ["Emergency Mental Health Services", "Go to your nearest emergency room or call emergency services (911/999) for immediate danger.", "emergency", null, "911", "RED"],
    ["Breathwork & Stress Relief Guide", "Free downloadable guide with breathing exercises proven to reduce cortisol in under 5 minutes.", "self-help", "https://mindbridge.app/breathwork", null, "GREEN"],
  ];
  for (const r of resources) {
    seed.run(...r);
  }
}

export interface IStorage {
  // Users
  createUser(data: InsertUser): User;
  getUserByEmail(email: string): User | undefined;
  getUserById(id: number): User | undefined;

  // Checkins
  createCheckin(data: InsertCheckin): Checkin;
  getCheckinsByUser(userId: number, limit?: number): Checkin[];
  getRecentCheckins(limit?: number): Checkin[];

  // Resources
  getResourcesByLevel(level: string): Resource[];
  getAllResources(): Resource[];

  // Messages
  createMessage(data: InsertMessage): Message;
  getRecentMessages(limit?: number): Message[];
}

export const storage: IStorage = {
  createUser(data) {
    return db.insert(schema.users).values(data).returning().get()!;
  },
  getUserByEmail(email) {
    return db.select().from(schema.users).where(eq(schema.users.email, email)).get();
  },
  getUserById(id) {
    return db.select().from(schema.users).where(eq(schema.users.id, id)).get();
  },
  createCheckin(data) {
    return db.insert(schema.checkins).values(data).returning().get()!;
  },
  getCheckinsByUser(userId, limit = 30) {
    return db.select().from(schema.checkins)
      .where(eq(schema.checkins.userId, userId))
      .orderBy(desc(schema.checkins.createdAt))
      .limit(limit)
      .all();
  },
  getRecentCheckins(limit = 50) {
    return db.select().from(schema.checkins)
      .orderBy(desc(schema.checkins.createdAt))
      .limit(limit)
      .all();
  },
  getResourcesByLevel(level) {
    if (level === "ALL") return db.select().from(schema.resources).all();
    return db.select().from(schema.resources)
      .where(eq(schema.resources.level, level))
      .all();
  },
  getAllResources() {
    return db.select().from(schema.resources).all();
  },
  createMessage(data) {
    return db.insert(schema.messages).values(data).returning().get()!;
  },
  getRecentMessages(limit = 50) {
    return db.select().from(schema.messages)
      .orderBy(desc(schema.messages.createdAt))
      .limit(limit)
      .all();
  },
};
