import { ERROR_MESSAGES, HTTP_STATUS } from '@/lib/constants'
import { ContactFormSchema, validateContactForm } from '@/lib/schemas'
import { createNotionContactEntry } from '@/lib/notion'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body: ContactFormSchema = await req.json()
    const validatedData = validateContactForm(body)
    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.CONTACT.FAILED,
          details: validatedData.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const { firstName, lastName, email, message, phone } = body

    await createNotionContactEntry({
      firstName,
      lastName,
      email,
      message,
      phone,
    })

    return NextResponse.json({
      success: true,
      data: { firstName, lastName, email, message, phone },
    })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.CONTACT.FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
