'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import CallRequestForm from '@/components/common/CallRequestForm'
import useFlag from '@/hooks/useFlag'

const CallRequestDemo = () => {
  const [isCallRequestFormOpen, callRequestFormOpen, callRequestFormClose] =
    useFlag()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Call Request Demo
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Click the button below to open the Call Request form
        </p>
        <Button
          onClick={callRequestFormOpen}
          className="w-full"
          variant="accent"
        >
          Schedule a Call
        </Button>

        <CallRequestForm
          isOpen={isCallRequestFormOpen}
          onClose={callRequestFormClose}
        />
      </div>
    </div>
  )
}

export default CallRequestDemo
