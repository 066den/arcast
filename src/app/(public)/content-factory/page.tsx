import HeroSection from '@/components/sections/HeroSection'
export default function ContentFactoryPage() {
  return (
    <div className="text-content leading-snug mb-10">
      <HeroSection
        title="Content Factory"
        description="Our best market practices giving you real result"
        image="/assets/images/factory-banner.webp"
      />
      <section className="py-6 md:py-16 max-w-4xl mx-auto text-center">
        <h2 className="mb-4 text-accent">What is Content Factory?</h2>
        <h3>
          From <span className="text-accent">concept</span> to getting{' '}
          <span className="text-accent">impressions</span>. <br />
          We <span className="text-accent">guide</span> you through the{' '}
          <span className="text-accent">entire process</span>.
        </h3>
      </section>
      <section className="md:py-12 py-6">
        <h2 className="mb-6 text-accent">What is a Content Factory?</h2>
        <p className="md:text-3xl text-2xl font-nunito-sans leading-normal">
          A Content Factory is more than just content creation — it’s a
          streamlined, full-cycle approach to producing and distributing digital
          content that builds awareness, drives engagement, and delivers
          measurable results. Think of it as your dedicated production line for
          ideas: from initial concept to published content that gets impressions
          and real impact.
        </p>
      </section>
      <section className="md:py-12 py-6">
        <h2 className="mb-6 text-accent">Why a Content Factory Matters?</h2>
        <p className="md:text-3xl text-2xl font-nunito-sans leading-normal">
          In today’s digital world, businesses and personal brands can’t rely on
          random posts or occasional campaigns. Audiences expect consistent,
          high-quality content across multiple platforms — whether it’s video,
          social media, podcasts, or written stories.
        </p>
        <p className="md:text-3xl text-2xl font-nunito-sans leading-normal">
          A Content Factory ensures that your content isn’t just produced, but
          strategically aligned with your brand voice, optimized for your
          audience, and ready to generate visibility.
        </p>
      </section>
      <section className="md:pt-12 pt-6">
        <h2 className="mb-6 text-accent">
          From Concept to Getting Impressions
        </h2>
        <p className="md:text-3xl text-2xl font-nunito-sans leading-normal mb-4">
          We guide you through the entire process of content creation and
          distribution:
        </p>
        <div className="md:py-6 py-4">
          <h3 className="text-accent mb-5">Concept Development</h3>
          <ul className="custom-list md:text-3xl text-2xl">
            <li>Market and competitor research</li>
            <li>Creative ideation and storyboarding</li>
            <li>Aligning content with brand goals</li>
          </ul>
        </div>
        <div className="md:py-6 py-4">
          <h3 className="text-accent mb-5">Content Production</h3>
          <ul className="custom-list md:text-3xl text-2xl">
            <li>Video production, podcast recording, and photography</li>
            <li>Graphic design and motion design for visual impact</li>
            <li>Copywriting and scriptwriting tailored for your audience</li>
          </ul>
        </div>
        <div className="md:py-6 py-4">
          <h3 className="text-accent mb-5">Post-Production & Optimization</h3>
          <ul className="custom-list md:text-3xl text-2xl">
            <li>Professional editing, sound design, and visual polish</li>
            <li>
              Formatting for multiple platforms (YouTube, Instagram, TikTok,
              etc.)
            </li>
            <li>SEO optimization and keyword integration</li>
          </ul>
        </div>
        <div className="md:py-6 py-4">
          <h3 className="text-accent mb-5">Distribution & Amplification</h3>
          <ul className="custom-list md:text-3xl text-2xl">
            <li>Social media scheduling and publishing</li>
            <li>Community management and audience engagement</li>
            <li>Paid promotion and campaign support for wider reach</li>
          </ul>
        </div>
        <div className="md:py-6 py-4">
          <h3 className="text-accent mb-5">Performance & Insights</h3>
          <ul className="custom-list md:text-3xl text-2xl">
            <li>Analytics tracking (views, impressions, conversions)</li>
            <li>Iteration and continuous improvement</li>
            <li>Scaling content strategy for growth</li>
          </ul>
        </div>
      </section>
      <section className="md:py-10 py-6">
        <h2 className="mb-6 text-accent">The Result</h2>
        <p className="md:text-3xl text-2xl font-nunito-sans leading-normal">
          With a Content Factory model, you don’t just get isolated pieces of
          content. You get a consistent, scalable, and ROI-driven content
          ecosystem. Every video, post, or article is connected to a bigger
          picture — helping you attract attention, engage your audience, and
          grow your business sustainably.
        </p>
      </section>
      <section className="md:py-10 py-6">
        <h2 className="mb-6 text-accent">Who Needs a Content Factory?</h2>
        <ul className="custom-list md:text-3xl text-2xl">
          <li>Startups building brand awareness</li>
          <li>Established businesses scaling digital presence</li>
          <li>
            Companies entering new markets and needing consistent storytelling
          </li>
        </ul>
      </section>
      <section className="md:py-10 py-6">
        <h2 className="mb-6 text-accent">Why Work With Us?</h2>
        <p className="md:text-3xl text-2xl font-nunito-sans leading-normal">
          We combine creative production with data-driven strategy. That means
          your content isn’t only beautiful — it performs.
        </p>
        <p className="text-3xl font-nunito-sans leading-normal">
          From brainstorming ideas to watching impressions turn into
          conversions, we guide you every step of the way.
        </p>
      </section>
    </div>
  )
}
