import { useEffect, useRef } from 'react'
import { Modal } from '@/components/modals/modal'

import Image from 'next/image'

interface PaymentModalProps {
  isOpen: boolean
  paymentUrl: string
  totalAmount: number
  onClose: () => void
}

const PaymentModal = ({
  isOpen,
  paymentUrl,
  totalAmount,
  onClose,
}: PaymentModalProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [process.env.MAMO_BASE_URL]
      if (!allowedOrigins.includes(event.origin)) {
        return
      }

      const { type, status: msgStatus, data, error } = event.data
    }

    if (isOpen) {
      window.addEventListener('message', handleMessage)
    }

    return () => window.removeEventListener('message', handleMessage)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment"
      description="Complete your payment to proceed with the booking"
      size="lg"
      contentClassName="h-full sm:max-h-[calc(100vh-100px)]"
      footer={
        <div className="flex items-center gap-2 justify-between text-sm p-4 pt-0 text-gray-500">
          Powered by{' '}
          <Image src="/icons/mamo_logo.svg" alt="Mamo" width={72} height={18} />
        </div>
      }
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between pb-4 px-4 mb-4 border-b font-medium border-gray-200">
          <span>Total</span>
          <span>AED {totalAmount}</span>
        </div>

        {paymentUrl ? (
          <iframe
            ref={iframeRef}
            src={paymentUrl}
            className="border-none flex-1"
            title="MamoPayPayment"
            allow="payment"
            sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              No payment URL available
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default PaymentModal
