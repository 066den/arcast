import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from '@/lib/constants'
import { CallRequestFormSchema, validateCallRequestForm } from '@/lib/schemas'
import { prisma } from '@/lib/prisma'
import { createNotionCallRequestEntry } from '@/lib/notion'
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

    const { firstName, lastName, phone, callDateTime, message } =
      validatedData.data

    // Normalize message: convert empty string to null for database
    const normalizedMessage =
      !message ||
      message === '' ||
      (typeof message === 'string' && message.trim() === '')
        ? null
        : typeof message === 'string'
          ? message
          : null

    // Normalize lastName: convert empty string to null for database
    const normalizedLastName =
      !lastName ||
      lastName === '' ||
      (typeof lastName === 'string' && lastName.trim() === '')
        ? null
        : typeof lastName === 'string'
          ? lastName
          : null

    // Create call request in database
    const callRequest = await prisma.callRequest.create({
      data: {
        firstName,
        lastName: normalizedLastName,
        phone,
        callDateTime: new Date(callDateTime),
        message: normalizedMessage,
      },
    })

    // Create entry in Notion (don't fail if Notion fails)
    try {
      await createNotionCallRequestEntry({
        firstName,
        lastName: normalizedLastName || '',
        phone,
        callDateTime,
        message: normalizedMessage || '',
      })
    } catch {
      // Silently fail if Notion fails
    }

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.CALL_REQUEST.SUBMITTED,
      data: {
        id: callRequest.id,
        firstName: callRequest.firstName,
        lastName: callRequest.lastName,
        phone: callRequest.phone,
        callDateTime: callRequest.callDateTime,
        message: callRequest.message,
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Call request error:', error)
    }

    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.CALL_REQUEST.FAILED,
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
