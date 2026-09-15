import { Header } from "@/components/v2/header";
import { HeroSection } from "@/components/v2/hero-section";
import { PhilosophySection } from "@/components/v2/philosophy-section";
import { TrustSection } from "@/components/v2/trust-section";
import { SalesLetterSection } from "@/components/v2/sales-letter-section";
import { FaqSection } from "@/components/v2/faq-section";
import { FooterSection } from "@/components/v2/footer-section";
import { VSLSection } from "@/components/survey/vsl-section";
import { buildBrand } from "@/lib/brand";

// Keep /v2 out of search indexes until cutover. Scoped to this route only — the
// root "/" landing stays fully indexable (no robots directive at the layout level).
// title/description are inherited from app/layout.tsx and intentionally left alone.
export const metadata = {
  robots: { index: false, follow: false },
};

// New /v2 landing — reproduces the rei-survey-template-v2 landing layout (same hero
// shape, stat tiles, card chrome and section rhythm), branded from Rivoir's real env
// values via buildBrand(). Additive: the existing "/" landing and thank-you page are
// untouched. The v2 template's section animations live in the template's globals.css
// (which we do NOT modify); they're injected here, scoped to this page.
export default function V2LandingPage() {
  const brand = buildBrand();
  return (
    <main className="min-h-screen bg-white" style={{ ["--brand-accent" as any]: brand.accentColor }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes reveal-up { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scale-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes bounce-x { 0%,100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
@keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
.animate-reveal-up { animation: reveal-up 0.8s ease-out forwards; }
.animate-scale-in { animation: scale-in 0.6s ease-out forwards; }
.animate-bounce-x { animation: bounce-x 1.5s ease-in-out infinite; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-300 { animation-delay: 300ms; }
`,
        }}
      />
      <Header brand={brand} />
      <HeroSection brand={brand} />
      <PhilosophySection brand={brand} />

      {/* VSL slot — Rivoir's live Vidalytics VSL (components/survey/vsl-section.tsx,
          reused as-is; returns null when the NEXT_PUBLIC_VIDALYTICS_* env is unset). */}
      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-[#0F1D2F] md:text-4xl">
            See How It Works
          </h2>
          <VSLSection />
        </div>
      </section>

      <TrustSection brand={brand} />
      <SalesLetterSection brand={brand} />
      <FaqSection brand={brand} />
      <FooterSection brand={brand} />
    </main>
  );
}
