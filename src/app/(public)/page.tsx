import ContactForm from '@/components/common/ContactForm'
import HeroSection from '@/components/sections/HeroSection'
import FeaturesSection from '@/components/sections/FeaturesSection'
import AboutSection from '@/components/sections/AboutSection'
import EpisodeSection from '@/components/sections/EpisodeSection'
import videoUrl from 'https://res.cloudinary.com/deuvbiekl/video/upload/v1747050218/desk_bgzsdy.mp4'

export default function Home() {
  return (
    <div className="py-4">
      <HeroSection videoUrl={videoUrl} />
      <FeaturesSection />
      <AboutSection />
      <EpisodeSection />
      {/* Contact Form Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Have questions? We&apos;d love to hear from you.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600 dark:text-slate-300">
            <p>&copy; 2024 Arcast. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Built with ❤️ using Next.js, React, Tailwind CSS, and shadcn/ui
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
