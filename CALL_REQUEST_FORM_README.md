# CallRequestForm Component

A React component for scheduling call requests, similar to ContactForm but with date and time selection capabilities.

## Features

- **First Name** - Required field with validation
- **Last Name** - Optional field with validation
- **Phone** - Required field with phone number validation
- **Call Date & Time** - Required field with date and time pickers
  - Date picker using Calendar component (prevents selecting past dates)
  - Time picker with 30-minute intervals
  - Combined validation to ensure future date/time

## Database Schema

The component uses a `CallRequest` table with the following structure:

```sql
CREATE TABLE "call_requests" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT NOT NULL,
    "callDateTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "call_requests_pkey" PRIMARY KEY ("id")
);
```

## Usage

```tsx
import { useState } from 'react'
import CallRequestForm from '@/components/common/CallRequestForm'
import useFlag from '@/hooks/useFlag'

const MyComponent = () => {
  const [isCallRequestFormOpen, callRequestFormOpen, callRequestFormClose] =
    useFlag()

  return (
    <div>
      <button onClick={callRequestFormOpen}>Schedule a Call</button>

      <CallRequestForm
        isOpen={isCallRequestFormOpen}
        onClose={callRequestFormClose}
      />
    </div>
  )
}
```

## API Endpoint

The form submits to `/api/call-request` with the following payload:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "callDateTime": "2025-01-26T14:30:00.000Z"
}
```

## Validation

- **First Name**: Required, 2-100 characters, letters and spaces only
- **Last Name**: Optional, max 100 characters, letters and spaces only
- **Phone**: Required, valid phone number format
- **Call Date & Time**: Required, must be in the future

## Dependencies

- React Hook Form with Zod validation
- Framer Motion for animations
- Date-fns for date formatting
- Custom UI components (Modal, Input, Button, Calendar, TimePicker)

## Demo

Visit `/call-request-demo` to see the component in action.
