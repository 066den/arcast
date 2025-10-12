'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { siteConfig } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { ArrowLeftIcon } from 'lucide-react'

export default function SuccessPage() {
  const router = useRouter()
  const onClose = () => {
    router.push('/')
  }
  return (
    <div className="px-4 min-h-screen">
      <div className="w-full mt-5">
        <Button onClick={onClose} variant="outline">
          <ArrowLeftIcon className="w-4 h-4" /> Back
        </Button>
      </div>
      <div className="flex flex-col h-full items-center justify-center pb-5 lg:pb-0">
        <div className="relative w-32 h-44 mb-8">
          <Image
            src="/assets/images/complete.webp"
            alt="Ticket background"
            width={128}
            height={128}
            priority
          />
        </div>

        <h2 className="mb-4 text-2xl 3xl:text-[32px] font-hankenGrotesk font-medium text-[#333333] text-center">
          Your Booking is Confirmed!
        </h2>

        <p className="mb-8 font-nunitoSans font-normal text-lg 3xl:text-xl text-center text-[#333333] max-w-md">
          You will receive an update on whatsapp or email.
        </p>

        <div className="text-center text-base 3xl:text-xl ">
          <p className="text-[#989898] mb-2">
            If you need assistance, contact us at
          </p>
          <a
            href={`mailto:${siteConfig.contact.bookingEmail}`}
            className="text-blue-500 hover:text-blue-600 block mb-1"
          >
            {siteConfig.contact.bookingEmail}
          </a>
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="text-blue-500 hover:text-blue-600"
          >
            {siteConfig.contact.phone}
          </a>
        </div>
      </div>
    </div>
  )
}
