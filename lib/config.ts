/**
 * lib/config.ts — Single server-side env var read point.
 * Import this ONLY in server components (layout.tsx, page.tsx, API routes).
 * Never import in "use client" components — pass values as props instead.
 */
const config = {
  // Brand
  companyName:     process.env.COMPANY_NAME     ?? "Your Home Buyers",
  phoneDisplay:    process.env.PHONE_DISPLAY     ?? "(800) 000-0000",
  phoneHref:       process.env.PHONE_HREF        ?? "8000000000",
  accentColor:     process.env.ACCENT_COLOR      ?? "#2563eb",
  headerBgColor:   process.env.HEADER_BG_COLOR   ?? "#ffffff",
  logoUrl:         process.env.LOGO_URL          ?? "",

  // Owner / personalization
  ownerName:       process.env.OWNER_NAME        ?? "",
  headshotUrl:     process.env.HEADSHOT_URL      ?? "",

  // Landing layout (grumpyhare style). Defaults are Rivoir's own files in /public, so the
  // page needs no new settings; each can be overridden from Vercel env without a code change.
  // Both Jamie images are his real photos (already transparent cut-outs), never generated people.
  ownerCutoutUrl:  process.env.OWNER_CUTOUT_URL  || "/images/jamie-hero.webp",   // webp copy of HEADSHOT_URL
  teamPhotoUrl:    process.env.TEAM_PHOTO_URL    || "/images/jamie-team.webp",   // webp copy of images/rivoir_landing.png
  heroBgUrl:       process.env.HERO_BG_URL       || "/images/hero-house.webp",   // AI house photo, no people
  teamBgUrl:       process.env.TEAM_BG_URL       || "/images/team-bg.webp",      // AI living room, no people
  marketName:      process.env.MARKET_NAME       || "the Bay Area",

  // Hero
  headline:        process.env.HEADLINE          ?? "Sell Your House Fast For Cash",
  headlineAccent:  process.env.HEADLINE_ACCENT   ?? "",
  subheadline:     process.env.SUBHEADLINE       ?? "No fees. No repairs. Cash offer in 24 hours.",

  // Service areas — JSON array of {id, centerLat, centerLng, radiusMiles}
  serviceAreas:    process.env.SERVICE_AREAS     ?? "[]",

  // Trust indicators
  stat1Value:      process.env.STAT_1_VALUE      ?? "1,000+",
  stat1Label:      process.env.STAT_1_LABEL      ?? "Homes Purchased",
  stat2Value:      process.env.STAT_2_VALUE      ?? "10+",
  stat2Label:      process.env.STAT_2_LABEL      ?? "Years in Business",
  stat3Value:      process.env.STAT_3_VALUE      ?? "24 Hrs",
  stat3Label:      process.env.STAT_3_LABEL      ?? "Cash Offer",
  // Licensed-agent disclosure (California DRE and equivalents). Free text so a
  // brokerage line, licence number and address can be set per client without a
  // code change. Empty for clients who are not licensed, and then nothing renders.
  licenseDisclosure: process.env.LICENSE_DISCLOSURE ?? "",

  // SEO
  metaTitle:       process.env.META_TITLE        || "Sell Your House Fast For Cash",
  metaDescription: process.env.META_DESCRIPTION  || "Get a fair cash offer for your home in 24 hours. No fees, no repairs, no hassle.",

  // Footer
  privacyPolicyUrl: process.env.PRIVACY_POLICY_URL ?? "/privacy",
  termsUrl:         process.env.TERMS_URL           ?? "/terms",

  // Survey disqualification — comma-separated property type IDs to hard-disqualify
  disqualifiedPropertyTypes: process.env.DISQUALIFIED_PROPERTY_TYPES ?? "mobile-home,land,other",

  // Webhook (server-side only — never exposed to browser)
  webhookUrl:      process.env.WEBHOOK_URL ?? "",
} as const

export default config
export type Config = typeof config