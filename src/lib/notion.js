// src/utils/notion.utils.js - Enhanced version
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Database IDs
const DATABASE_ID = process.env.NOTION_DATABASE_ID
const LEADS_DATABASE_ID = process.env.NOTION_LEADS_DATABASE_ID
const CONTACT_DATABASE_ID = process.env.NOTION_CONTACT_DATABASE_ID
const ORDERS_DATABASE_ID = process.env.NOTION_ORDERS_DATABASE_ID

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
      return null
    }

    // Validate input data
    validateBookingData(booking)

    // Get database schema for validation (optional)
    // const schema = await getDatabaseSchema(DATABASE_ID)

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
    // Don't throw error to avoid breaking the main booking flow
    // Just log it and return null
    return null
  }
}

/**
 * Create an order entry in Notion
 */
export async function createNotionOrderEntry(order) {
  try {
    if (!isNotionConfigured()) {
      return null
    }

    if (!ORDERS_DATABASE_ID) {
      return null
    }

    const properties = {
      Name: {
        title: createTitle(order.serviceName),
      },
      OrderID: {
        rich_text: createRichText(order.id.toString()),
      },
      'Service Name': {
        rich_text: createRichText(order.serviceName),
      },
      'Customer Name': {
        rich_text: createRichText(order.lead.fullName),
      },
      'Customer Email': {
        email: order.lead.email,
      },
      'Phone Number': {
        phone_number: order.lead.phoneNumber,
      },
      Whatsapp: {
        phone_number: order.lead.whatsappNumber || order.lead.phoneNumber,
      },
      'Total Cost': {
        number: parseFloat(order.totalCost.toString()),
      },
      'Final Amount': {
        number: parseFloat(
          order.finalAmount?.toString() || order.totalCost.toString()
        ),
      },
      Status: {
        select: {
          name: order.status,
        },
      },
      'Order Date': {
        date: {
          start: order.createdAt.toISOString(),
        },
      },
    }

    if (order.description) {
      properties['Description'] = {
        rich_text: createRichText(order.description),
      }
    }

    if (order.requirements) {
      properties['Requirements'] = {
        rich_text: createRichText(order.requirements),
      }
    }

    if (order.deadline) {
      properties['Deadline'] = {
        date: {
          start: order.deadline.toISOString(),
        },
      }
    }

    if (order.estimatedDays) {
      properties['Estimated Days'] = {
        number: order.estimatedDays,
      }
    }

    const response = await notion.pages.create({
      parent: {
        database_id: ORDERS_DATABASE_ID,
      },
      properties,
    })

    return response
  } catch (error) {
    return null
  }
}

/**
 * Create a lead entry in Notion
 */
export async function createNotionLeadEntry(lead) {
  try {
    if (!LEADS_DATABASE_ID) {
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
          name: 'New',
        },
      },
      Source: {
        select: {
          name: 'Website',
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

    return response
  } catch (error) {
    // Don't throw error to avoid breaking the main lead creation flow
    return null
  }
}

export async function createNotionContactEntry(contactData) {
  try {
    if (!CONTACT_DATABASE_ID) {
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
        rich_text: createRichText(`+${contactData.phone}`.trim()),
      },
      Message: {
        rich_text: createRichText(contactData.message),
      },
    }

    const response = await notion.pages.create({
      parent: {
        database_id: CONTACT_DATABASE_ID,
      },
      properties,
    })

    return response
  } catch (error) {
    throw new Error(error.message)
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

    return response
  } catch (error) {
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
    return []
  }
}

/**
 * Test Notion connection
 */
export async function testNotionConnection() {
  try {
    const user = await notion.users.me()

    // Test database access
    if (DATABASE_ID) {
      try {
        const schema = await getDatabaseSchema(DATABASE_ID, false)
        // Database access successful
      } catch (dbError) {
        return {
          success: false,
          error: `Database access failed: ${dbError.message}`,
          databaseId: DATABASE_ID,
        }
      }
    } else {
      return {
        success: false,
        error: 'NOTION_DATABASE_ID not configured',
        databaseId: null,
      }
    }

    return { success: true, user: user.name, databaseId: DATABASE_ID }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// ========== EXPORT CONSTANTS ==========
export const NOTION_DATABASES = {
  BOOKINGS: DATABASE_ID,
  LEADS: LEADS_DATABASE_ID,
  CONTACTS: CONTACT_DATABASE_ID,
  ORDERS: ORDERS_DATABASE_ID,
}

// ========== DEFAULT EXPORT ==========
const notionUtils = {
  createNotionBookingEntry,
  createNotionOrderEntry,
  createNotionLeadEntry,
  createNotionContactEntry,
  updateNotionBookingStatus,
  getNotionBookings,
  testNotionConnection,
  isNotionConfigured,
  NOTION_DATABASES,
}

export default notionUtils
