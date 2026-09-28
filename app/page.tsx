import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import {
  StatsBand,
  WeBuySection,
  TeamBand,
  ProcessSection,
  SituationsSection,
  FinalCta,
  SiteFooter,
} from "@/components/landing/sections";
import { SalesLetterSection } from "@/components/v2/sales-letter-section";
import { FaqSection } from "@/components/v2/faq-section";
import { OfferModal } from "@/components/landing/cta";
import { buildBrand } from "@/lib/brand";

// Layout modeled on homebuyer.grumpyhare.com, ported from Sellers Choice (go.balboahomebuyers.com).
// Every CTA opens the two-step form in a pop-up (OfferModal). The previous layout's
// components stay in components/v2/* (the survey card, sales letter and FAQ are reused).
export default function HomePage() {
  const brand = buildBrand();
  return (
    <main className="v2-light rv-landing min-h-screen bg-white" style={{ ["--brand-accent" as any]: brand.accentColor }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
/* Scope the shadcn design tokens to LIGHT values on this page (Rivoir's :root shadcn
   defaults are dark). Deliberately omits --accent and --primary so they inherit Rivoir's
   #052547 from the layout: the survey card stays navy. */
.v2-light {
  --background: #FFFFFF; --foreground: #0F1D2F;
  --card: #FFFFFF; --card-foreground: #0F1D2F;
  --popover: #FFFFFF; --popover-foreground: #0F1D2F;
  --secondary: #F5F7FA; --secondary-foreground: #0F1D2F;
  --muted: #F5F7FA; --muted-foreground: #5A6B7D;
  --destructive: #DC2626; --destructive-foreground: #FFFFFF;
  --border: #E2E8F0; --input: #FFFFFF; --ring: #1B2A4A;
  background-color: #FFFFFF; color: #0F1D2F;
}
@keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
`,
        }}
      />
      <SiteHeader brand={brand} />
      <Hero brand={brand} />
      <StatsBand brand={brand} />
      <WeBuySection brand={brand} />
      <TeamBand brand={brand} />
      <ProcessSection />
      <SituationsSection />
      <SalesLetterSection brand={brand} landing />
      <FaqSection brand={brand} landing />
      <FinalCta />
      <SiteFooter brand={brand} />
      <OfferModal brand={brand} />
    </main>
  );
}
