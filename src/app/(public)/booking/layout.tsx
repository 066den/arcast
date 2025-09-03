import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Studio Session | Arcast',
  description:
    'Book your professional podcast recording studio session. Choose from our state-of-the-art studios, packages, and additional services.',
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
