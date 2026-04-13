import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "subscribers.json");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Subscriber {
  email: string;
  variant: string;
  source: string;
  createdAt: string;
}

async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeSubscribers(subscribers: Subscriber[]): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(subscribers, null, 2), "utf-8");
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { email, variant, source } = body as Record<string, unknown>;

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanVariant = typeof variant === "string" ? variant.slice(0, 10) : "unknown";
  const cleanSource = typeof source === "string" ? source.slice(0, 50) : "unknown";

  const subscribers = await readSubscribers();

  if (subscribers.some((s) => s.email === cleanEmail)) {
    return NextResponse.json({ error: "Cet email est déjà enregistré." }, { status: 400 });
  }

  subscribers.push({
    email: cleanEmail,
    variant: cleanVariant,
    source: cleanSource,
    createdAt: new Date().toISOString(),
  });

  await writeSubscribers(subscribers);

  return NextResponse.json({ success: true });
}
