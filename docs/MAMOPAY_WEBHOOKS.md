# MamoPay Webhooks Setup

## 1. Add Environment Variables

Add to `.env` file:

```env
# MamoPay Configuration
MAMO_BASE_URL=https://api.mamopay.com
MAMO_API_KEY=your_api_key_here
MAMO_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## 2. Webhook URL

Your webhook endpoint:

```
https://yourdomain.com/api/webhooks/mamo
```

## 3. Setup in MamoPay Dashboard

1. Login to [MamoPay Dashboard](https://dashboard.mamopay.com)
2. Navigate to **Settings** → **Webhooks**
3. Click **Add Webhook**
4. Enter URL: `https://yourdomain.com/api/webhooks/mamo`
5. Select events (enabled_events):
   - ✅ `charge.succeeded` - Successful one-off payment
   - ✅ `charge.failed` - Failed one-off payment
   - ✅ `charge.authorized` - Charge placed on hold
   - ✅ `charge.card_verified` - Card verification payment
   - ✅ `charge.refund_initiated` - Refund initialization
   - ✅ `charge.refunded` - Successful refund
   - ✅ `charge.refund_failed` - Failed refund
   - ✅ `subscription.succeeded` - Successful subscription payment
   - ✅ `subscription.failed` - Failed subscription payment
   - ✅ `payment_link.create` - Payment link created
   - ✅ `payout.processed` - Settled payout
   - ✅ `payout.failed` - Rejected payout

6. Copy **Webhook Secret** and add it to `.env`

## 4. Event Processing

### charge.succeeded

**Successful payment completion**

- Booking/Order status → `CONFIRMED`
- Payment status → `COMPLETED`
- Records completion time (`completedAt`)

### charge.failed / subscription.failed

**Payment failed**

- Booking/Order status → `CANCELLED`
- Payment status → `FAILED`

### charge.authorized

**Payment authorization (on hold)**

- Payment status → `PENDING`
- Charge is placed on hold awaiting capture
- Booking/Order remains unchanged

### charge.refunded

**Refund completed**

- Booking/Order status → `CANCELLED`
- Payment status → `REFUNDED`
- Records refund time (`refundedAt`)

### charge.refund_initiated

**Refund in progress**

- Updates payment metadata
- No status changes (awaiting completion)

### charge.refund_failed

**Refund failed**

- Logs failure event
- No status changes
- Consider admin notification

### subscription.succeeded

**Subscription payment successful**

- For future subscription features
- Currently just logged

### Informational Events

The following events are logged but don't trigger status changes:

- `charge.card_verified` - Card verification completed
- `payment_link.create` - Payment link created
- `payout.processed` - Payout settled
- `payout.failed` - Payout rejected

## 5. Testing

### Local Testing with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel
ngrok http 3000

# Use the ngrok URL in MamoPay webhook settings
https://xxxx-xx-xx-xxx-xx.ngrok.io/api/webhooks/mamo
```

### Verify Endpoint Status

```bash
# GET request to check status
curl https://yourdomain.com/api/webhooks/mamo

# Response:
{
  "message": "MamoPay Webhook Endpoint",
  "status": "active",
  "url": "https://yourdomain.com/api/webhooks/mamo"
}
```

### Test POST Request

```bash
curl -X POST https://yourdomain.com/api/webhooks/mamo \
  -H "Content-Type: application/json" \
  -H "x-mamo-signature: your_signature" \
  -d '{
    "event_type": "charge.succeeded",
    "data": {
      "id": "mamo_payment_id",
      "external_id": "booking_or_order_id",
      "status": "captured",
      "amount": 100,
      "amount_currency": "AED"
    }
  }'
```

## 6. Monitoring

Check webhook logs:

```bash
# In production
tail -f /var/log/app/webhooks.log

# In development
npm run dev
# Logs output to console
```

## 7. Security

### Signature Verification

The webhook verifies request signature using `MAMO_WEBHOOK_SECRET`:

```typescript
const expectedSignature = crypto
  .createHmac('sha256', MAMO_WEBHOOK_SECRET)
  .update(payload)
  .digest('hex')
```

### Best Practices:

- ✅ Always use HTTPS
- ✅ Keep `MAMO_WEBHOOK_SECRET` secure
- ✅ Verify signature for all requests
- ✅ Log all events for audit trail
- ✅ Implement idempotency (handle duplicate events)

## 8. Troubleshooting

### Webhook Not Firing

1. Verify URL is publicly accessible (not localhost)
2. Ensure SSL certificate is valid
3. Check server logs for errors
4. Use ngrok for local testing
5. Verify webhook is enabled in MamoPay dashboard

### Error 401 (Invalid signature)

1. Check `MAMO_WEBHOOK_SECRET` in `.env`
2. Ensure correct secret from MamoPay dashboard
3. Verify signature format in `x-mamo-signature` header
4. Check if secret was recently rotated

### Error 404 (Resource not found)

1. Verify `external_id` exists in database
2. Check logs for incoming ID
3. Ensure `external_id` is correctly set when creating payment link

### Error 500 (Internal server error)

1. Check server logs for stack trace
2. Verify database connection
3. Ensure Prisma schema matches database
4. Check for missing required fields

## 9. Advanced Features

### Email Notifications

Add email notifications for successful payments:

```typescript
case 'charge.succeeded': {
  // ... existing code ...

  // Send confirmation email
  await sendPaymentConfirmationEmail({
    to: booking?.lead?.email || order?.lead?.email,
    bookingId: booking?.id,
    orderId: order?.id,
    amount: data.amount,
    currency: data.amount_currency,
  })

  break
}
```

### Webhook Retry Logic

MamoPay automatically retries webhook delivery on failure:

- 1st attempt: Immediate
- 2nd attempt: After 1 hour
- 3rd attempt: After 6 hours
- 4th attempt: After 24 hours

**Important:** Ensure your endpoint is idempotent to handle duplicate events.

### Idempotency Implementation

```typescript
// Check if event was already processed
const processedEvent = await prisma.webhookEvent.findUnique({
  where: { externalId: data.id },
})

if (processedEvent) {
  console.log('Event already processed:', data.id)
  return NextResponse.json({ success: true, message: 'Already processed' })
}

// Process event and record it
await prisma.webhookEvent.create({
  data: {
    externalId: data.id,
    eventType: event_type,
    processedAt: new Date(),
  },
})
```

## 10. Event Flow Diagram

```
Customer Payment
       ↓
charge.authorized (optional - if using hold)
       ↓
charge.succeeded ← Main event
       ↓
Booking/Order CONFIRMED
       ↓
Payment COMPLETED

If refund requested:
       ↓
charge.refund_initiated
       ↓
charge.refunded
       ↓
Booking/Order CANCELLED
```

## 11. Support

For MamoPay-specific issues:

- Documentation: https://docs.mamopay.com
- Support: support@mamopay.com
- Dashboard: https://dashboard.mamopay.com

For application issues:

- Check application logs
- Review Prisma database state
- Verify environment variables
