import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  try {
    await prisma.subscriber.create({
      data: {
        email: cleanEmail,
        variant: cleanVariant,
        source: cleanSource,
      },
    });
  } catch (err: unknown) {
    // Neon/Postgres unique constraint → email déjà enregistré
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Cet email est déjà enregistré." }, { status: 400 });
    }
    console.error("subscribe error", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
