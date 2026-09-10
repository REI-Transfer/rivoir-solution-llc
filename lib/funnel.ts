// Durable per-step funnel tracking (env-gated, no PII). Fires a tiny beacon to
// /api/track on each step transition — deduped per step per session. Never throws
// into the form. Enable with NEXT_PUBLIC_FUNNEL_TRACKING="true".
const ENABLED = process.env.NEXT_PUBLIC_FUNNEL_TRACKING === "true"
const CLIENT_SLUG = "rivoir-solution-llc"
const SID_KEY = "rivoir_funnel_session"
const FIRED_KEY = "rivoir_funnel_fired"

function uuid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  } catch {}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0
    const v = ch === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getSessionId(): string {
  try {
    let sid = window.sessionStorage.getItem(SID_KEY)
    if (!sid) {
      sid = uuid()
      window.sessionStorage.setItem(SID_KEY, sid)
    }
    return sid
  } catch {
    return uuid()
  }
}

function param(name: string): string | undefined {
  try {
    const v = new URLSearchParams(window.location.search).get(name)
    return v || undefined
  } catch {
    return undefined
  }
}

/** Fire a durable funnel beacon for a step, at most once per step per session. */
export function trackStep(step: number, stepName: string): void {
  if (!ENABLED || typeof window === "undefined") return
  try {
    let fired: number[] = []
    try {
      fired = JSON.parse(window.sessionStorage.getItem(FIRED_KEY) || "[]")
    } catch {}
    if (Array.isArray(fired) && fired.includes(step)) return

    const payload = {
      client_slug: CLIENT_SLUG,
      session_id: getSessionId(),
      step,
      step_name: stepName,
      utm_source: param("utm_source"),
      utm_medium: param("utm_medium"),
      utm_campaign: param("utm_campaign"),
      utm_term: param("utm_term"),
      utm_content: param("utm_content"),
      fbclid: param("fbclid"),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    }
    const body = JSON.stringify(payload)

    let sent = false
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        sent = navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))
      }
    } catch {}
    if (!sent) {
      try {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {})
      } catch {}
    }

    try {
      window.sessionStorage.setItem(FIRED_KEY, JSON.stringify([...(Array.isArray(fired) ? fired : []), step]))
    } catch {}
  } catch {
    /* never throw into the form */
  }
}
