// ========== BUSINESS CONSTANTS ==========

export const VAT_RATE = 0 // 0% VAT
export const MAX_BOOKING_HOURS = 8
export const CLEARING_TIME_MINUTES = 30
export const MIN_BOOKING_DURATION = 1 // hours
export const MAX_ADVANCE_BOOKING_DAYS = 90

// ========== BOOKING CONSTANTS ==========

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  PAID: 'PAID',
} as const

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const

export const PAYMENT_METHODS = {
  CARD: 'Card',
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CRYPTO: 'Crypto',
} as const

export const DISCOUNT_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
} as const

// ========== STUDIO CONSTANTS ==========

export const STUDIO_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  MAINTENANCE: 'Maintenance',
} as const

export const EQUIPMENT_TYPES = {
  MICROPHONE: 'Microphone',
  AUDIO_INTERFACE: 'Audio Interface',
  MONITORS: 'Monitors',
  HEADPHONES: 'Headphones',
  ACOUSTIC_TREATMENT: 'Acoustic Treatment',
} as const

// ========== LEAD CONSTANTS ==========

export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL: 'Proposal',
  WON: 'Won',
  LOST: 'Lost',
} as const

export const LEAD_SOURCES = {
  WEBSITE: 'Website',
  PHONE: 'Phone',
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  REFERRAL: 'Referral',
  SOCIAL_MEDIA: 'Social Media',
  ADVERTISING: 'Advertising',
} as const

// ========== CONTACT CONSTANTS ==========

export const CONTACT_STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
} as const

// ========== API CONSTANTS ==========

export const API_ENDPOINTS = {
  BOOKINGS: '/api/bookings',
  STUDIOS: '/api/studios',
  PACKAGES: '/api/packages',
  CONTACT: '/api/contact',
  PAYMENT_LINK: '/api/payment-link',
  BLOG: '/api/blog',
} as const

export const ROUTES = {
  BOOKING: '/booking',
  SERVICES: '/services',
  CASE_STUDIES: '/case-studies',
  CONTENT_FACTORY: '/content-factory',
  BLOG: '/blog',
  ABOUT_US: '/about-us',
  FOR_BUSINESS: '/business',
  ADMIN: '/admin',
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ========== ERROR MESSAGES ==========

export const ERROR_MESSAGES = {
  INVALID_REQUEST: 'Invalid request body',
  INVALID_DATE_FORMAT: 'Invalid date format',
  INVALID_VIEW_PARAMETER: 'Invalid view parameter. Use "day" or "month"',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  INVALID_TIME_FORMAT: 'Invalid time format. Use HH:MM format',
  HOURS_MUST_BE_BETWEEN_0_AND_23: 'Hours must be between 0 and 23',
  MINUTES_MUST_BE_BETWEEN_0_AND_59: 'Minutes must be between 0 and 59',
  BOOKING: {
    NOT_FOUND: 'Booking not found',
    SLOT_UNAVAILABLE: 'Selected time slot is not available',
    INVALID_DURATION: 'Invalid booking duration',
    CAPACITY_EXCEEDED: 'Requested seats exceed studio capacity',
    CONFLICT: 'Selected time conflicts with existing bookings',
    FAILED: 'Failed to create booking',
    PAST_DATE: 'Cannot book slots for past dates',
    SELECT_TIME: 'Please select a time',
  },
  ORDER: {
    NOT_FOUND: 'Order not found',
  },
  STUDIO: {
    NOT_FOUND: 'Studio not found',
    INACTIVE: 'Studio is currently inactive',
    CAPACITY_EXCEEDED: 'Number of seats exceeds studio capacity',
    OUTSIDE_WORKING_HOURS: 'Selected time is outside of studio working hours',
    FAILED_TO_FETCH_TIMES: 'Failed to fetch times',
    FAILED_TO_FETCH_STUDIOS: 'Failed to fetch studios',
    FAILED_TO_UPDATE_STUDIO: 'Failed to update studio',
    FAILED_TO_CREATE_STUDIO: 'Failed to create studio',
  },
  PAYMENT: {
    FAILED: 'Payment processing failed',
    INVALID_AMOUNT: 'Invalid payment amount',
    ALREADY_EXISTS: 'Payment already exists',
  },
  NOTION: {
    CONNECTION_FAILED: 'Failed to connect to Notion',
    ENTRY_CREATION_FAILED: 'Failed to create Notion entry',
    DATABASE_NOT_FOUND: 'Notion database not found',
  },
  PACKAGE: {
    NOT_FOUND: 'Package not found',
  },
  DISCOUNT: {
    INVALID: 'Invalid or expired discount code',
    FIRST_TIME_ONLY: 'This discount code is only valid for first-time clients',
  },
  SERVICE: {
    NOT_FOUND: 'Additional service not found',
  },
  FILE: {
    TYPE_NOT_ALLOWED: 'File type not allowed',
    SIZE_EXCEEDED: 'File size exceeded',
  },
  CONTACT: {
    FAILED: 'Failed to submit contact form',
  },
  PRISMA: {
    NOT_INITIALIZED: 'Prisma client is not initialized',
  },
  ARTICLE: {
    NOT_FOUND: 'Article not found',
  },
} as const

// ========== SUCCESS MESSAGES ==========

export const SUCCESS_MESSAGES = {
  BOOKING: {
    CREATED: 'Booking created successfully',
    UPDATED: 'Booking updated successfully',
    CANCELLED: 'Booking cancelled successfully',
  },
  CONTACT: {
    SUBMITTED: 'Contact form submitted successfully',
  },
  PAYMENT: {
    PROCESSED: 'Payment processed successfully',
  },
  FILE: {
    UPLOADED: 'File uploaded successfully',
  },
} as const

// ========== VALIDATION CONSTANTS ==========

export const VALIDATION = {
  NAME_REGEX: /^[a-zA-Z\s]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-()]+$/,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_MESSAGE_LENGTH: 10,
  MAX_MESSAGE_LENGTH: 1000,
} as const

// ========== PAYMENT CONSTANTS ==========

export const CURRENCIES = {
  AED: 'AED',
  USD: 'USD',
  EUR: 'EUR',
} as const

export const CURRENCY_SYMBOLS = {
  AED: 'AED',
  USD: '$',
  EUR: '€',
} as const

// ========== MAMO PAY CONSTANTS ==========

export const PAYMENT_PROVIDER = {
  TITLE: 'ARcast Booking',
  CURRENCY: 'AED',
  RETURN_URL: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success`,
  FAILURE_RETURN_URL: `${process.env.NEXT_PUBLIC_APP_URL}/booking/failed`,
} as const

// ========== FILE CONSTANTS ==========

export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/aac'],
} as const

export const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  AUDIO: 50 * 1024 * 1024, // 50MB
} as const

export const ASPECT_RATIOS = {
  SQUARE: 1, // 1:1 - square
  LANDSCAPE: 16 / 9, // 16:9 - wide format
  PORTRAIT: 3 / 4, // 3:4 - portrait
  GOLDEN: 1.618, // Golden ratio
  CLASSIC: 4 / 3, // 4:3 - classic
  WIDE: 21 / 9, // 21:9 - ultra wide
  INSTAGRAM: 1, // 1:1 - Instagram square
  STORY: 9 / 16, // 9:16 - Instagram Stories
  COVER: 2 / 3, // 2:3 - book cover
} as const

// ========== EXPORT TYPES ==========

export type BookingStatus = keyof typeof BOOKING_STATUS
export type PaymentStatus = keyof typeof PAYMENT_STATUS
export type PaymentMethod = keyof typeof PAYMENT_METHODS
export type StudioStatus = keyof typeof STUDIO_STATUS
export type LeadStatus = keyof typeof LEAD_STATUS
export type LeadSource = keyof typeof LEAD_SOURCES
export type ContactStatus = keyof typeof CONTACT_STATUS
export type Currency = keyof typeof CURRENCIES
export type AspectRatio = keyof typeof ASPECT_RATIOS
export type PaymentProvider = keyof typeof PAYMENT_PROVIDER

// ========== DEFAULT EXPORT ==========

export default {
  VAT_RATE,
  MAX_BOOKING_HOURS,
  CLEARING_TIME_MINUTES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  STUDIO_STATUS,
  LEAD_STATUS,
  LEAD_SOURCES,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CURRENCIES,
  ASPECT_RATIOS,
} as const
