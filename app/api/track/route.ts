import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// Fire-and-forget funnel beacon relay. Forwards the beacon to the n8n Form Funnel
// Tracker server-side and ALWAYS returns 204 — it never throws to the client and
// never blocks the form. No-op when FUNNEL_TRACKING_WEBHOOK_URL is unset.
export async function POST(req: Request) {
  try {
    const url = process.env.FUNNEL_TRACKING_WEBHOOK_URL
    if (url) {
      const body = await req.text()
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* swallow — tracking must never affect the user */
  }
  return new NextResponse(null, { status: 204 })
}
