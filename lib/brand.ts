/**
 * lib/brand.ts — serializable brand object threaded from the /v2 server page into
 * the v2 section components (ported from rei-survey-template-v2). buildBrand() reads
 * the existing server-only lib/config (READ only — config.ts is never modified) and
 * maps Rivoir's v1-shaped config onto the v2 Brand shape. Client components import
 * ONLY the `Brand` type from here.
 */
import config from "./config"

export interface Brand {
  companyName: string
  phoneDisplay: string
  phoneHref: string
  callinDisplay: string
  callinHref: string
  accentColor: string
  logoUrl: string
  ownerName: string
  headshotUrl: string
  foundersPhotoUrl: string
  foundersCaption: string
  headline: string
  headlineAccent: string
  subheadline: string
  marketName: string
  smsKeyword: string
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  // Rivoir extension: the env-driven property-type DQ list, threaded to the
  // two-step survey card (DISQUALIFIED_PROPERTY_TYPES is server-only, not NEXT_PUBLIC).
  disqualifiedPropertyTypes: string[]
}

/** Server-only. Build the plain, serializable brand object from Rivoir's env config. */
export function buildBrand(): Brand {
  return {
    companyName: config.companyName,
    phoneDisplay: config.phoneDisplay,
    phoneHref: config.phoneHref,
    callinDisplay: "",
    callinHref: "",
    accentColor: config.accentColor,
    logoUrl: config.logoUrl,
    ownerName: config.ownerName,
    headshotUrl: config.headshotUrl,
    // The v2 hero owner cut-out uses foundersPhotoUrl; Rivoir's owner image is HEADSHOT_URL.
    foundersPhotoUrl: config.headshotUrl,
    foundersCaption: "",
    headline: config.headline,
    headlineAccent: config.headlineAccent,
    subheadline: config.subheadline,
    marketName: "",
    smsKeyword: "",
    stat1Value: config.stat1Value,
    stat1Label: config.stat1Label,
    stat2Value: config.stat2Value,
    stat2Label: config.stat2Label,
    stat3Value: config.stat3Value,
    stat3Label: config.stat3Label,
    disqualifiedPropertyTypes: config.disqualifiedPropertyTypes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  }
}

/** Convenience for copy: the market phrase, e.g. "in Salt Lake City" or "in your area". */
export function marketPhrase(brand: Brand): string {
  return brand.marketName ? brand.marketName : "your area"
}
