// src/utils/notion.utils.js - Enhanced version
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Database IDs
const DATABASE_ID = process.env.NOTION_DATABASE_ID
const LEADS_DATABASE_ID = process.env.NOTION_LEADS_DATABASE_ID
const CONTACT_DATABASE_ID = process.env.NOTION_CONTACT_DATABASE_ID

// Cache for database schemas
const schemaCache = new Map()

// ========== UTILITY FUNCTIONS ==========

/**
 * Check if Notion is properly configured
 */
export function isNotionConfigured() {
  return !!(process.env.NOTION_API_KEY && DATABASE_ID)
}

/**
 * Safe text content creation for Notion
 */
function createTextContent(content) {
  return content ? String(content) : ''
}

/**
 * Create rich text block for Notion
 */
function createRichText(content) {
  return [
    {
      text: {
        content: createTextContent(content),
      },
    },
  ]
}

/**
 * Create title block for Notion
 */
function createTitle(content) {
  return [
    {
      text: {
        content: createTextContent(content),
      },
    },
  ]
}

/**
 * Get database schema with caching
 */
async function getDatabaseSchema(databaseId, useCache = true) {
  try {
    // Check cache first
    if (useCache && schemaCache.has(databaseId)) {
      return schemaCache.get(databaseId)
    }

    const response = await notion.databases.retrieve({
      database_id: databaseId,
    })

    // Cache the schema
    if (useCache) {
      schemaCache.set(databaseId, response.properties)
    }

    return response.properties
  } catch (error) {
    console.error(`Error retrieving database schema for ${databaseId}:`, error)
    throw error
  }
}

/**
 * Get available properties from database schema
 */
export async function getDatabaseProperties() {
  try {
    if (!isNotionConfigured()) {
      return null
    }

    const schema = await getDatabaseSchema(DATABASE_ID, false)
    return Object.keys(schema)
  } catch (error) {
    console.error('Error getting database properties:', error)
    return null
  }
}

/**
 * Validate required fields before creating entry
 */
function validateBookingData(booking) {
  const requiredFields = ['id', 'lead', 'startTime', 'endTime', 'numberOfSeats']
  const missing = requiredFields.filter(field => !booking[field])

  if (missing.length > 0) {
    throw new Error(`Missing required booking fields: ${missing.join(', ')}`)
  }

  if (!booking.lead.fullName || !booking.lead.email) {
    throw new Error('Missing required lead information: fullName and email')
  }
}

function validateLeadData(lead) {
  const requiredFields = ['fullName', 'email', 'phoneNumber']
  const missing = requiredFields.filter(field => !lead[field])

  if (missing.length > 0) {
    throw new Error(`Missing required lead fields: ${missing.join(', ')}`)
  }
}

// ========== MAIN FUNCTIONS ==========

/**
 * Create a booking entry in Notion
 */
export async function createNotionBookingEntry(booking) {
  try {
    if (!isNotionConfigured()) {
      console.warn('Notion not configured, skipping booking entry creation')
      return null
    }

    // Validate input data
    validateBookingData(booking)

    // Get database schema for validation (optional)
    // const schema = await getDatabaseSchema(DATABASE_ID)
    // console.log('📊 Database schema loaded')

    // Prepare properties object
    const properties = {
      Name: {
        title: createTitle(booking.lead.fullName),
      },
      bookingID: {
        rich_text: createRichText(booking.id.toString()),
      },
      location: {
        rich_text: createRichText(booking.lead.recordingLocation),
      },
      'Number of guests': {
        number: parseInt(booking.numberOfSeats) || 0,
      },
      'Booking Date': {
        date: {
          start: booking.startTime.toISOString(),
          end: booking.endTime.toISOString(),
        },
      },
      'Customer Email': {
        email: booking.lead.email,
      },
      'Phone Number': {
        phone_number: booking.lead.phoneNumber,
      },
      Whatsapp: {
        phone_number: booking.lead.whatsappNumber || booking.lead.phoneNumber,
      },
    }

    // Add optional fields only if they exist
    if (booking.studio?.name) {
      properties['Setup'] = {
        select: {
          name: booking.studio.name,
        },
      }
    }

    if (booking.package?.name) {
      properties['Package'] = {
        select: {
          name: booking.package.name || 'Recording Only',
        },
      }
    }

    // Add additional services if available
    if (
      booking.additionalServices &&
      Array.isArray(booking.additionalServices)
    ) {
      const serviceNames = booking.additionalServices
        .map(service => service.name || service.title)
        .filter(Boolean)

      if (serviceNames.length > 0) {
        properties['Additional Services'] = {
          multi_select: serviceNames.map(name => ({ name })),
        }
      }
    }

    // Set payment method
    properties['Payment Method'] = {
      select: {
        name: booking.paymentMethod || 'Card',
      },
    }

    // Create the entry
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID,
      },
      properties,
    })

    return response
  } catch (error) {
    console.error('❌ Error creating Notion booking entry:', error)

    // Don't throw error to avoid breaking the main booking flow
    // Just log it and return null
    return null
  }
}

/**
 * Create a lead entry in Notion
 */
export async function createNotionLeadEntry(lead) {
  try {
    if (!LEADS_DATABASE_ID) {
      console.warn(
        'NOTION_LEADS_DATABASE_ID not configured, skipping Notion lead entry'
      )
      return null
    }

    // Validate input data
    validateLeadData(lead)

    const properties = {
      Name: {
        title: createTitle(lead.fullName),
      },
      Email: {
        email: lead.email,
      },
      Phone: {
        phone_number: lead.phoneNumber,
      },
      WhatsApp: {
        phone_number: lead.whatsappNumber || lead.phoneNumber,
      },
      Location: {
        rich_text: createRichText(lead.recordingLocation),
      },
      Status: {
        select: {
          name: lead.status || 'New',
        },
      },
      Source: {
        select: {
          name: lead.source || 'Website',
        },
      },
      Created: {
        date: {
          start: (lead.createdAt || new Date()).toISOString(),
        },
      },
    }

    const response = await notion.pages.create({
      parent: {
        database_id: LEADS_DATABASE_ID,
      },
      properties,
    })

    console.log('✅ Successfully created Notion lead entry:', response.id)
    return response
  } catch (error) {
    console.error('❌ Error creating Notion lead entry:', error)

    // Don't throw error to avoid breaking the main lead creation flow
    return null
  }
}

/**
 * Create a contact form entry in Notion (for contact page)
 */
export async function createNotionContactEntry(contactData) {
  try {
    if (!CONTACT_DATABASE_ID) {
      console.warn(
        'NOTION_CONTACT_DATABASE_ID not configured, skipping contact entry'
      )
      return null
    }

    const properties = {
      Firstname: {
        title: createTitle(contactData.firstName),
      },
      Lastname: {
        rich_text: createRichText(contactData.lastName),
      },
      Email: {
        email: contactData.email,
      },
      Phone: {
        rich_text: createRichText(
          `${contactData.countryCode} ${contactData.phoneNumber}`.trim()
        ),
      },
      Message: {
        rich_text: createRichText(contactData.message),
      },
      Status: {
        select: {
          name: 'New',
        },
      },
      Created: {
        date: {
          start: new Date().toISOString(),
        },
      },
    }

    const response = await notion.pages.create({
      parent: {
        database_id: CONTACT_DATABASE_ID,
      },
      properties,
    })

    console.log('✅ Successfully created Notion contact entry:', response.id)
    return response
  } catch (error) {
    console.error('❌ Error creating Notion contact entry:', error)
    return null
  }
}

/**
 * Update booking status in Notion
 */
export async function updateNotionBookingStatus(
  notionPageId,
  status,
  additionalData = {}
) {
  try {
    if (!notionPageId || !isNotionConfigured()) {
      return null
    }

    const properties = {
      Status: {
        select: {
          name: status,
        },
      },
      Updated: {
        date: {
          start: new Date().toISOString(),
        },
      },
    }

    // Add any additional data
    if (additionalData.paymentStatus) {
      properties['Payment Status'] = {
        select: {
          name: additionalData.paymentStatus,
        },
      }
    }

    if (additionalData.notes) {
      properties['Notes'] = {
        rich_text: createRichText(additionalData.notes),
      }
    }

    const response = await notion.pages.update({
      page_id: notionPageId,
      properties,
    })

    console.log(`✅ Updated Notion booking status to: ${status}`)
    return response
  } catch (error) {
    console.error('❌ Error updating Notion booking status:', error)
    return null
  }
}

/**
 * Get bookings from Notion (for admin dashboard)
 */
export async function getNotionBookings(filters = {}) {
  try {
    if (!isNotionConfigured()) {
      return []
    }

    // Build filter object
    const notionFilter = {}

    if (filters.status) {
      notionFilter.and = notionFilter.and || []
      notionFilter.and.push({
        property: 'Status',
        select: {
          equals: filters.status,
        },
      })
    }

    if (filters.dateFrom) {
      notionFilter.and = notionFilter.and || []
      notionFilter.and.push({
        property: 'Booking Date',
        date: {
          on_or_after: filters.dateFrom,
        },
      })
    }

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: Object.keys(notionFilter).length > 0 ? notionFilter : undefined,
      sorts: [
        {
          property: 'Booking Date',
          direction: 'descending',
        },
      ],
      page_size: filters.limit || 50,
    })

    // Parse and return simplified data
    return response.results.map(page => ({
      id: page.id,
      bookingId: page.properties.bookingID?.rich_text[0]?.text?.content || '',
      customerName: page.properties.Name?.title[0]?.text?.content || '',
      email: page.properties['Customer Email']?.email || '',
      phone: page.properties['Phone Number']?.phone_number || '',
      date: page.properties['Booking Date']?.date?.start || '',
      numberOfGuests: page.properties['Number of guests']?.number || 0,
      studio: page.properties.Setup?.select?.name || '',
      package: page.properties.Package?.select?.name || '',
      status: page.properties.Status?.select?.name || 'Unknown',
      createdAt: page.created_time,
    }))
  } catch (error) {
    console.error('❌ Error fetching Notion bookings:', error)
    return []
  }
}

/**
 * Test Notion connection
 */
export async function testNotionConnection() {
  try {
    const user = await notion.users.me()
    console.log('✅ Notion connection successful:', user.name)

    // Test database access
    if (DATABASE_ID) {
      try {
        const schema = await getDatabaseSchema(DATABASE_ID, false)
        console.log(
          '✅ Database access successful, fields:',
          Object.keys(schema).length
        )
      } catch (dbError) {
        console.error('❌ Database access failed:', dbError.message)
        return {
          success: false,
          error: `Database access failed: ${dbError.message}`,
          databaseId: DATABASE_ID,
        }
      }
    } else {
      console.warn('⚠️ NOTION_DATABASE_ID not configured')
      return {
        success: false,
        error: 'NOTION_DATABASE_ID not configured',
        databaseId: null,
      }
    }

    return { success: true, user: user.name, databaseId: DATABASE_ID }
  } catch (error) {
    console.error('❌ Notion connection failed:', error)
    return { success: false, error: error.message }
  }
}

// ========== EXPORT CONSTANTS ==========
export const NOTION_DATABASES = {
  BOOKINGS: DATABASE_ID,
  LEADS: LEADS_DATABASE_ID,
  CONTACTS: CONTACT_DATABASE_ID,
}

// ========== DEFAULT EXPORT ==========
const notionUtils = {
  createNotionBookingEntry,
  createNotionLeadEntry,
  createNotionContactEntry,
  updateNotionBookingStatus,
  getNotionBookings,
  testNotionConnection,
  isNotionConfigured,
  NOTION_DATABASES,
}

export default notionUtils
