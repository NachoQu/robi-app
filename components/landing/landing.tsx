import { LandingNav } from './landing-nav'
import { LandingHero } from './landing-hero'
import { LandingHow } from './landing-how'
import { LandingScience } from './landing-science'
import { LandingBenefits } from './landing-benefits'
import { LandingPricing } from './landing-pricing'
import { LandingFaq } from './landing-faq'
import { LandingCta } from './landing-cta'
import { LandingFooter } from './landing-footer'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingHow />
        <LandingScience />
        <LandingBenefits />
        <LandingPricing />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}
