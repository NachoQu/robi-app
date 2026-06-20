import { LandingNav } from './landing-nav'
import { LandingHero } from './landing-hero'
import { LandingHow } from './landing-how'
import { LandingBenefits } from './landing-benefits'
import { LandingPricing } from './landing-pricing'
import { LandingFooter } from './landing-footer'

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingHow />
        <LandingBenefits />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  )
}
