/**
 * lib/service-area-v2.ts — the SINGLE owner of the /v2 landing's geo gate.
 *
 * The /v2 page has exactly one geo gate and it lives here. The v2
 * address-autocomplete component is deliberately gate-free; the survey calls
 * isWithinServiceArea() from this file and nowhere else.
 *
 * Reads a JSON array of circles (passed explicitly, or NEXT_PUBLIC_SERVICE_AREAS):
 *   [{ "lat": 37.77, "lng": -122.42, "radiusMiles": 30 }, ...]
 * (aliases accepted: latitude/longitude, radius_miles/radius).
 *
 * When the list is empty / missing / unparseable the gate is PERMISSIVE by
 * design — every address is accepted (Rivoir ships nationwide, SERVICE_AREAS="[]").
 * num() rejects non-finite values so a bad entry is skipped, never NaN; a
 * wrong key shape yields undefined and the entry is skipped, never a silent
 * accept-everywhere from a parse that "succeeded" with garbage.
 */

export interface ServiceCircle {
  lat: number
  lng: number
  radiusMiles: number
}

function num(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : (v as number)
  return typeof n === "number" && Number.isFinite(n) ? n : undefined
}

export function parseServiceAreas(raw?: string): ServiceCircle[] {
  const src = raw ?? process.env.NEXT_PUBLIC_SERVICE_AREAS ?? ""
  if (!src.trim()) return []
  try {
    const parsed = JSON.parse(src)
    if (!Array.isArray(parsed)) return []
    const circles: ServiceCircle[] = []
    for (const c of parsed) {
      if (!c || typeof c !== "object") continue
      const lat = num((c as any).lat ?? (c as any).latitude)
      const lng = num((c as any).lng ?? (c as any).longitude ?? (c as any).lon)
      const radiusMiles = num((c as any).radiusMiles ?? (c as any).radius_miles ?? (c as any).radius)
      if (lat === undefined || lng === undefined || radiusMiles === undefined) continue
      circles.push({ lat, lng, radiusMiles })
    }
    return circles
  } catch {
    return []
  }
}

function haversineMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8 // Earth radius in miles
  const dLat = ((bLat - aLat) * Math.PI) / 180
  const dLng = ((bLng - aLng) * Math.PI) / 180
  const lat1 = (aLat * Math.PI) / 180
  const lat2 = (bLat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * True when the point is inside the configured service area. Permissive (true)
 * when no areas are configured, or when lat/lng are unknown (never block a lead
 * we can't geolocate).
 */
export function isWithinServiceArea(lat?: number, lng?: number, raw?: string): boolean {
  const circles = parseServiceAreas(raw)
  if (circles.length === 0) return true
  if (lat === undefined || lng === undefined) return true
  return circles.some((c) => haversineMiles(lat, lng, c.lat, c.lng) <= c.radiusMiles)
}
