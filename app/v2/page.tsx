import Image from "next/image"
import { SurveyCard } from "@/components/v2/survey-card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import config from "@/lib/config"

// New /v2 landing — a clean v2-style two-step form, additive alongside the existing
// "/" landing (which is untouched). Both run side by side until the domain is cut over.
export default function V2LandingPage() {
  const stats = [
    { value: config.stat1Value, label: config.stat1Label },
    { value: config.stat2Value, label: config.stat2Label },
    { value: config.stat3Value, label: config.stat3Label },
  ].filter((s) => s.label)

  const disqualifiedPropertyTypes = config.disqualifiedPropertyTypes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <main className="relative min-h-screen bg-[#F5F7FA]">
      <div className="relative z-10">
        <Header
          companyName={config.companyName}
          phoneDisplay={config.phoneDisplay}
          phoneHref={config.phoneHref}
          logoUrl={config.logoUrl}
          headerBgColor={config.headerBgColor}
        />

        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10 lg:px-8">
          {/* Hero */}
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0F1D2F] md:text-5xl lg:leading-[1.1] text-balance">
              {config.headline}
              {config.headlineAccent && (
                <span className="text-[var(--accent)]"> {config.headlineAccent}</span>
              )}
            </h1>
            {config.subheadline && (
              <p className="mt-3 text-base text-[#5A6B7D] md:text-lg">{config.subheadline}</p>
            )}

            {/* Trust indicators — accent checkmarks */}
            {stats.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 md:gap-5">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                      <svg className="h-3.5 w-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#334155] md:text-base">
                      {stat.value ? (
                        <>
                          <strong>{stat.value}</strong> {stat.label}
                        </>
                      ) : (
                        stat.label
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two-step survey */}
          <div className="mt-6 md:mt-8 flex justify-center">
            <SurveyCard
              companyName={config.companyName}
              phoneDisplay={config.phoneDisplay}
              phoneHref={config.phoneHref}
              disqualifiedPropertyTypes={disqualifiedPropertyTypes}
              serviceAreasRaw={config.serviceAreas}
            />
          </div>

          {/* Meet the owner — local trust */}
          {config.headshotUrl && (
            <div className="mx-auto mt-10 md:mt-14 max-w-sm text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                Meet {config.ownerName || config.companyName}
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#0F1D2F] md:text-2xl text-balance">
                A local homebuyer helping homeowners sell with confidence.
              </h2>
              <Image
                src={config.headshotUrl}
                alt={config.ownerName || config.companyName}
                width={800}
                height={800}
                sizes="(max-width: 768px) 100vw, 384px"
                className="mx-auto mt-4 h-auto w-full max-w-xs rounded-2xl"
              />
            </div>
          )}
        </div>

        <Footer
          companyName={config.companyName}
          phoneDisplay={config.phoneDisplay}
          phoneHref={config.phoneHref}
          privacyPolicyUrl={config.privacyPolicyUrl}
          termsUrl={config.termsUrl}
        />
      </div>
    </main>
  )
}
