/**
 * Show the visitor's own county instead of "Bay Area" (Jamie, 2026-10-02 call: Santa Cruz and
 * Monterey sellers distrust out-of-area buyers). Vercel adds the visitor's approximate location
 * to every request (x-vercel-ip-* headers). We match the city to one of Jamie's three counties,
 * then fall back to distance from the county's main towns. County, not city: phone networks often
 * place a visitor in the wrong town but rarely in the wrong county. Anything else keeps "Bay Area".
 */
import type { Brand } from "./brand"

type AreaKey = "santa-cruz" | "monterey" | "santa-clara"
const AREAS: Record<AreaKey, { label: string; cities: string[]; anchors: [number, number][] }> = {
  "santa-cruz": {
    label: "Santa Cruz County",
    cities: ["santa cruz", "watsonville", "scotts valley", "capitola", "aptos", "soquel", "felton", "boulder creek",
      "ben lomond", "freedom", "live oak", "la selva beach", "davenport", "brookdale", "corralitos", "rio del mar",
      "bonny doon", "zayante", "mount hermon", "twin lakes", "amesti", "interlaken", "pasatiempo"],
    anchors: [[36.9741, -122.0308], [36.9102, -121.7569]],
  },
  monterey: {
    label: "Monterey County",
    cities: ["monterey", "salinas", "seaside", "marina", "pacific grove", "carmel", "carmel-by-the-sea", "carmel valley",
      "del rey oaks", "sand city", "gonzales", "soledad", "greenfield", "king city", "castroville", "prunedale", "pajaro",
      "moss landing", "aromas", "chualar", "big sur", "pebble beach", "spreckels", "las lomas", "elkhorn", "boronda",
      "san ardo", "san lucas", "bradley", "jolon"],
    anchors: [[36.6777, -121.6555], [36.6002, -121.8947], [36.2121, -121.1263]],
  },
  "santa-clara": {
    label: "Santa Clara County",
    cities: ["san jose", "santa clara", "sunnyvale", "mountain view", "palo alto", "cupertino", "milpitas", "campbell",
      "los gatos", "saratoga", "morgan hill", "gilroy", "los altos", "los altos hills", "monte sereno", "san martin",
      "stanford", "alviso", "coyote"],
    anchors: [[37.3382, -121.8863], [37.3688, -122.0363], [37.0058, -121.5683]],
  },
}
const RADIUS_MILES = 15

function miles(a: [number, number], b: [number, number]): number {
  const r = (d: number) => (d * Math.PI) / 180
  const dLat = r(b[0] - a[0]), dLon = r(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLon / 2) ** 2
  return 3958.8 * 2 * Math.asin(Math.sqrt(h))
}

/** `override` is the ?area= query value (santa-cruz | monterey | santa-clara | bay-area), used to preview each version. */
export function areaFromRequest(h: Headers, override?: string): AreaKey | null {
  if (override === "bay-area") return null
  if (override && override in AREAS) return override as AreaKey
  if ((h.get("x-vercel-ip-country") || "") !== "US" || (h.get("x-vercel-ip-country-region") || "") !== "CA") return null
  let city = ""
  try { city = decodeURIComponent(h.get("x-vercel-ip-city") || "").toLowerCase().trim() } catch { city = "" }
  for (const k of Object.keys(AREAS) as AreaKey[]) if (city && AREAS[k].cities.includes(city)) return k
  const lat = parseFloat(h.get("x-vercel-ip-latitude") || ""), lon = parseFloat(h.get("x-vercel-ip-longitude") || "")
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null
  let best: { k: AreaKey; d: number } | null = null
  for (const k of Object.keys(AREAS) as AreaKey[])
    for (const a of AREAS[k].anchors) {
      const d = miles([lat, lon], a)
      if (d <= RADIUS_MILES && (!best || d < best.d)) best = { k, d }
    }
  return best ? best.k : null
}

/** Swap "Bay Area" for the visitor's county in the headline and every "in the Bay Area" phrase. */
export function localizeBrand(brand: Brand, area: AreaKey | null): Brand {
  if (!area) return brand
  const label = AREAS[area].label
  return {
    ...brand,
    headline: brand.headline.replace(/Bay Area/g, label),
    marketName: /bay area/i.test(brand.marketName) ? label : brand.marketName,
  }
}
