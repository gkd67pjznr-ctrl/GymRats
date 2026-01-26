// src/lib/userDirectory.ts
import type { ID } from "./socialModel";

// Single source of truth for demo users.
// Later: replace with real user profiles fetched from backend.
export const ME_ID: ID = "u_demo_me";

export type DemoUser = {
  id: ID;
  name: string;
  subtitle?: string;
  bio?: string;
};

export const DIRECTORY: DemoUser[] = [
  { id: ME_ID, name: "You", subtitle: "builder mode", bio: "Shipping small wins." },
  { id: "u_demo_1" as ID, name: "Sarah", subtitle: "Leg day enabler", bio: "Training, food prep, and chaotic kindness." },
  { id: "u_demo_2" as ID, name: "TJ", subtitle: "Chaos + caffeine", bio: "Data + vibes. Heavy sets, loud music." },
  { id: "u_demo_3" as ID, name: "Mark", subtitle: "Gym homie", bio: "Consistency > motivation. Bench enjoyer." },
  { id: "u_demo_4" as ID, name: "Olivia", subtitle: "Runner arc", bio: "Zone 2 menace. Mobility nerd." },
];

export function getUser(id: ID): DemoUser {
  return DIRECTORY.find((u) => u.id === id) ?? { id, name: String(id) };
}

export function displayName(id: ID): string {
  return getUser(id).name;
}
