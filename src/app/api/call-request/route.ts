import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '@/lib/constants'
import { CallRequestFormSchema, validateCallRequestForm } from '@/lib/schemas'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body: CallRequestFormSchema = await req.json()
    const validatedData = validateCallRequestForm(body)

    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.CALL_REQUEST.FAILED,
          details: validatedData.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const { firstName, lastName, phone, callDateTime } = body

    // Create call request in database
    const callRequest = await prisma.callRequest.create({
      data: {
        firstName,
        lastName,
        phone,
        callDateTime: new Date(callDateTime),
      },
    })

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.CALL_REQUEST.SUBMITTED,
      data: {
        id: callRequest.id,
        firstName: callRequest.firstName,
        lastName: callRequest.lastName,
        phone: callRequest.phone,
        callDateTime: callRequest.callDateTime,
      },
    })
  } catch (error) {
    
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.CALL_REQUEST.FAILED },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
