import { getCurrentUserWithProfile } from '@/lib/auth'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import ProblemSolutionSection from './components/ProblemSolutionSection'
import FeaturesSection from './components/FeaturesSection'
import AITranslationSection from './components/AITranslationSection'
import BeforeAfterSection from './components/BeforeAfterSection'
import TestimonialSection from './components/TestimonialSection'
import PricingSection from './components/PricingSection'
import PaymentGuideSection from './components/PaymentGuideSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

export default async function LandingPage() {
  const { profile } = await getCurrentUserWithProfile()
  const authProfile = profile
    ? { role: profile.role as 'professor' | 'student' }
    : null

  return (
    <main>
      <Navbar profile={authProfile} />
      <HeroSection profile={authProfile} />
      <ProblemSolutionSection />
      <FeaturesSection />
      <AITranslationSection />
      <BeforeAfterSection />
      <TestimonialSection />
      <PricingSection />
      <PaymentGuideSection />
      <CTASection profile={authProfile} />
      <Footer />
    </main>
  )
}
