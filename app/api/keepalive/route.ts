import { NextResponse } from "next/server";

// Appelée chaque jour par une tâche planifiée Vercel (voir vercel.json).
// Une petite lecture en base suffit à garder le projet Supabase actif,
// pour qu'il ne soit pas mis en pause automatiquement (offre gratuite).
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "Configuration Supabase manquante" }, { status: 500 });
  }
  try {
    const res = await fetch(`${url}/rest/v1/daily_news?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    return NextResponse.json({ ok: res.ok, status: res.status, at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
