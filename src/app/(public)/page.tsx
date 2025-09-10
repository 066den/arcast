import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import HeroBackground from '@/components/HeroBackground'
import ContactForm from '@/components/common/ContactForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative min-h-screen px-4 py-20 text-center overflow-hidden">
        <HeroBackground />
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Arcast
            </span>
          </h1>
          <p className="text-xl text-slate-100 dark:text-slate-100 mb-8 max-w-2xl mx-auto">
            A modern, beautiful, and powerful application built with Next.js,
            React, Tailwind CSS, and shadcn/ui components.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">Book Your Session</Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Features
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Discover what makes Arcast special with our powerful features and
            modern design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built with Next.js for optimal performance and blazing fast
                loading times.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <CardTitle>Beautiful UI</CardTitle>
              <CardDescription>
                Stunning design with Tailwind CSS and shadcn/ui components for a
                modern look.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <CardTitle>Type Safe</CardTitle>
              <CardDescription>
                Full TypeScript support for better development experience and
                fewer bugs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

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
