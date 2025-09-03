import { NextResponse } from 'next/server'
import { testNotionConnection, getDatabaseProperties } from '@/lib/notion'

export async function GET() {
  try {
    const result = await testNotionConnection()

    if (result.success) {
      // Get available database properties
      const properties = await getDatabaseProperties()

      return NextResponse.json({
        success: true,
        message: 'Notion connection successful',
        user: result.user,
        databaseId: result.databaseId,
        availableProperties: properties,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          databaseId: result.databaseId,
        },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
