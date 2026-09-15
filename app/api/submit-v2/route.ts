import { NextResponse } from "next/server"

/**
 * app/api/submit-v2/route.ts — submit endpoint for the /v2 two-step landing.
 *
 * Additive: the original /api/submit route is untouched. This one is env-driven
 * for GoFunnel (no hardcoded credential fallback — set GOFUNNEL_WEBHOOK_CREDENTIAL_ID
 * / GOFUNNEL_WEBHOOK_SECRET; when unset, GoFunnel forwarding is skipped) and carries
 * the same live Eloy Cim blocklist business rule as the original route.
 *
 * It forwards to the same n8n handler (WEBHOOK_URL); the handler's IF Second Submit
 * gate routes source:"basic-capture" (phase 1) to an upsert-only branch and everything
 * else (source:"qualifying-details", or none) to the full chain.
 */

const FORM_SLUG = "rivoir-solution-llc-survey"
const FORM_TITLE = "RIVOIR SOLUTIONS LLC Survey"

// Simple in-memory rate limiter (resets on deploy/restart)
const submissionLog = new Map<string, { count: number; firstSubmit: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const window = 60 * 60 * 1000 // 1 hour
  const maxSubmissions = 5 // two-step posts twice per lead; allow a full retry

  const entry = submissionLog.get(ip)
  if (!entry) {
    submissionLog.set(ip, { count: 1, firstSubmit: now })
    return false
  }
  if (now - entry.firstSubmit > window) {
    submissionLog.set(ip, { count: 1, firstSubmit: now })
    return false
  }
  entry.count++
  return entry.count > maxSubmissions
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many submissions. Please try again later." },
        { status: 429 }
      )
    }

    const data = await request.json()

    // Server-side validation
    const phone = (data.phone || "").replace(/\D/g, "").replace(/^1/, "")
    if (phone.length !== 10) {
      return NextResponse.json({ success: false, error: "Invalid phone" }, { status: 400 })
    }

    const email = (data.email || "").trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 })
    }

    if (!(data.firstName || data.name || "").trim()) {
      return NextResponse.json({ success: false, error: "Name required" }, { status: 400 })
    }

    if (!(data.address || "").trim()) {
      return NextResponse.json({ success: false, error: "Address required" }, { status: 400 })
    }

    // Blocklist gate (live business rule — carried from the original route): silently
    // drop specific leads before any fan-out. Matches normalized phone (last-10) OR
    // lowercased email only — never name. Returns the exact normal success shape so the
    // submitter sees the identical flow, but nothing is forwarded to n8n or GoFunnel.
    const BLOCKLIST = [{ phone: "8312360401", email: "lexhon434@gmail.com" }]
    const isBlocked = BLOCKLIST.some((b) => b.phone === phone || b.email === email)
    if (isBlocked) {
      return NextResponse.json({ success: true })
    }

    const payload = { ...data, server_ip: ip }

    const webhookUrl = process.env.WEBHOOK_URL
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    // --- GoFunnel external webhook: forward the lead for gf_sid attribution (env-driven) ---
    try {
      const GF_CREDENTIAL_ID = process.env.GOFUNNEL_WEBHOOK_CREDENTIAL_ID || ""
      const GF_BEARER = process.env.GOFUNNEL_WEBHOOK_SECRET || ""
      if (GF_CREDENTIAL_ID && GF_BEARER) {
        const gfCookie = request.headers.get("cookie") || ""
        const gfMatch = gfCookie.match(/(?:^|; )gf_sid=([^;]*)/)
        const gfSid = (data.gf_sid || (gfMatch ? decodeURIComponent(gfMatch[1]) : "") || "").toString().trim()
        const gfStr = (v: unknown) => (typeof v === "string" && v ? v : undefined)
        const gfName = ((data.name || "") as string).trim().split(/\s+/).filter(Boolean)
        const gfPayload = {
          type: "survey_submitted",
          email: email || undefined,
          phone: phone || undefined,
          firstName: gfStr(data.firstName) || gfName[0] || undefined,
          lastName: gfStr(data.lastName) || (gfName.length > 1 ? gfName.slice(1).join(" ") : undefined),
          sid: gfSid || undefined,
          formId: FORM_SLUG,
          formTitle: FORM_TITLE,
          idempotencyKey: gfStr(data.meta_event_id),
          leadQuestions: {
            is_legal_owner: gfStr(data.isLegalOwner),
            listed_on_market: gfStr(data.listedOnMarket),
            property_type: gfStr(data.propertyType),
            timeline: gfStr(data.timeline),
            asking_price: gfStr(data.askingPrice),
            condition: gfStr(data.condition),
            reason: gfStr(data.reason),
          },
          data: {
            qualified: data.qualified === true,
            lead_score: data.lead_score,
            lead_quality: data.lead_quality,
            meta_event_id: data.meta_event_id,
            meta_event_name: data.meta_event_name,
            meta_value: data.meta_value,
            address: data.address,
            state: data.state,
            city: data.city,
            county: data.county,
            utm_source: data.utm_source,
            utm_medium: data.utm_medium,
            utm_campaign: data.utm_campaign,
            utm_content: data.utm_content,
            utm_term: data.utm_term,
            fbclid: data.fbclid,
            gclid: data.gclid,
            msclkid: data.msclkid,
            ttclid: data.ttclid,
            referrer: data.referrer,
            landing_page: data.landing_page,
          },
        }
        await fetch(`https://app.gofunnel.ai/api/v2/webhooks/external?credential_id=${GF_CREDENTIAL_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${GF_BEARER}` },
          body: JSON.stringify(gfPayload),
        }).catch(() => {})
      }
    } catch {}

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
