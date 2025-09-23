'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeftIcon, Ban } from 'lucide-react'
import { siteConfig } from '@/lib/config'
import { Button } from '@/components/ui/button'
import PaymentModal from '@/components/booking/PaymentModal'
import useFlag from '@/hooks/useFlag'
import { apiRequest } from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/constants'
import { useState } from 'react'

export default function FailedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPaymentModalOpen, openPaymentModal, closePaymentModal] = useFlag()
  const [paymentLink, setPaymentLink] = useState<string>('')
  const onClose = () => {
    router.push('/')
  }

  const onTryAgain = async () => {
    const paymentLinkId = searchParams.get('paymentLinkId')
    try {
      const response = await apiRequest<{ paymentLink: string }>(
        `${API_ENDPOINTS.PAYMENT_LINK}/${paymentLinkId}`
      )
      setPaymentLink(response.paymentLink)
      openPaymentModal()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="px-4">
      <div className="w-full mt-5">
        <Button onClick={onClose} variant="outline">
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center h-full mx-4">
        <Ban className="text-red-600 mb-4" size={100} />
        <p className="mb-4 text-2xl 3xl:text-[32px] font-hankenGrotesk font-medium text-[#333333] text-center">
          Booking Failed
        </p>
        <p className="mb-4 font-nunitoSans font-normal text-lg 3xl:text-xl text-center text-[#333333] max-w-md">
          Something went wrong. Please try again.
        </p>
        {searchParams.get('paymentLinkId') && (
          <div className="text-center text-base 3xl:text-xl mb-8">
            <Button onClick={onTryAgain}>Try Again</Button>
          </div>
        )}
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
      <PaymentModal
        isOpen={isPaymentModalOpen}
        paymentUrl={paymentLink}
        onClose={closePaymentModal}
        totalAmount={100}
      />
    </div>
  )
}
