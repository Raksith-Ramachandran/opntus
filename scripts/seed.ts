/**
 * OPNTUS Database Seed Script
 * Run: npx ts-node scripts/seed.ts
 *
 * Creates:
 *  - 1 Admin account
 *  - 3 Listener accounts
 *  - Sample sessions and messages
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Listener } from "../backend/src/models/Listener";
import { User } from "../backend/src/models/User";
import { Session } from "../backend/src/models/Session";
import { Message } from "../backend/src/models/Message";

dotenv.config({ path: "./backend/.env" });

const ADMIN_KEY = process.env.ADMIN_REGISTRATION_KEY || "seed-admin-key";

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    Listener.deleteMany({}),
    User.deleteMany({}),
    Session.deleteMany({}),
    Message.deleteMany({}),
  ]);
  console.log("🗑  Cleared existing data");

  // Create Admin
  const admin = await Listener.create({
    name: "Admin",
    email: "admin@opntus.com",
    passwordHash: "admin123456",
    role: "admin",
    status: "online",
    isVerified: true,
  });
  console.log("👤 Admin created:", admin.email);

  // Create Listeners
  const listenerData = [
    { name: "Priya M.", email: "priya@opntus.com", totalSessions: 142, averageRating: 4.9 },
    { name: "James K.", email: "james@opntus.com", totalSessions: 98,  averageRating: 4.7 },
    { name: "Sara L.",  email: "sara@opntus.com",  totalSessions: 220, averageRating: 4.8 },
  ];

  const listeners = await Promise.all(
    listenerData.map(l =>
      Listener.create({ ...l, passwordHash: "listener123456", role: "listener", status: "offline", isVerified: true })
    )
  );
  console.log(`🎧 ${listeners.length} listeners created`);

  // Create sample users
  const users = await Promise.all([
    User.create({ sessionId: "sample_session_1", anonymousName: "CalmRiver21", mood: "anxious" }),
    User.create({ sessionId: "sample_session_2", anonymousName: "SilentSky88", mood: "lonely"  }),
    User.create({ sessionId: "sample_session_3", anonymousName: "BlueLeaf42",  mood: "stressed" }),
  ]);
  console.log(`👥 ${users.length} sample users created`);

  // Create sample completed sessions
  const sessions = await Promise.all(
    users.map((u, i) =>
      Session.create({
        userId: u._id,
        listenerId: listeners[i]._id,
        mood: u.mood,
        status: "completed",
        startedAt: new Date(Date.now() - (i + 1) * 3600000),
        endedAt: new Date(Date.now() - i * 3600000),
        durationSeconds: (18 + i * 8) * 60,
        userRating: 5 - i,
        listenerHelpful: true,
      })
    )
  );
  console.log(`💬 ${sessions.length} sample sessions created`);

  // Create sample messages
  const sampleConversation = [
    { senderType: "listener", message: "Hi there. I'm here and I'm listening. Take your time — there's no rush." },
    { senderType: "user",     message: "I've been feeling really overwhelmed lately with everything going on." },
    { senderType: "listener", message: "That sounds really hard. I hear you. How long have you been feeling this way?" },
    { senderType: "user",     message: "A few weeks I think. It just keeps building up." },
    { senderType: "listener", message: "Thank you for sharing that with me. You don't have to carry that alone." },
  ] as const;

  for (const session of sessions) {
    await Promise.all(
      sampleConversation.map((m, i) =>
        Message.create({
          sessionId: session._id,
          senderType: m.senderType,
          message: m.message,
          timestamp: new Date(session.startedAt!.getTime() + i * 60000),
        })
      )
    );
  }
  console.log("💬 Sample messages created");

  console.log("\n✅ Seed complete!");
  console.log("─────────────────────────────────────────");
  console.log("Admin login:    admin@opntus.com / admin123456");
  console.log("Listener login: priya@opntus.com / listener123456");
  console.log("─────────────────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error("Seed error:", err); process.exit(1); });
