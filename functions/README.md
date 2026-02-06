# Restaurant Platform Cloud Functions

This directory contains all Cloud Functions for the Restaurant Platform, built with TypeScript and Firebase Functions v4.

## Structure

```
functions/
├── src/
│   ├── api/                 # HTTP Functions
│   │   ├── createOrder.ts
│   │   ├── validateOrderPricing.ts
│   │   ├── applyCoupon.ts
│   │   ├── paymentWebhook.ts
│   │   ├── issueRefund.ts
│   │   └── generateInvoicePDF.ts
│   ├── triggers/            # Event Triggers
│   │   ├── updateLoyaltyPoints.ts
│   │   ├── notifyKitchen.ts
│   │   ├── sendPushNotification.ts
│   │   ├── nightlyReports.ts
│   │   ├── cleanupExpiredCoupons.ts
│   │   ├── onUserCreate.ts
│   │   └── updateMenuItemRating.ts
│   ├── utils/              # Utilities
│   │   ├── admin.ts
│   │   ├── validators.ts
│   │   ├── pricing.ts
│   │   ├── notifications.ts
│   │   └── email.ts
│   └── index.ts            # Main exports
├── package.json
└── tsconfig.json
```

## Functions Overview

### API Functions (HTTP)

1. **createOrder** - Create new orders with validation, pricing calculation, and inventory management
2. **validateOrderPricing** - Validate client-side pricing against server calculation
3. **applyCoupon** - Validate and apply coupon codes with complex rules
4. **paymentWebhook** - Handle payment gateway webhooks (Razorpay & Stripe)
5. **issueRefund** - Process refunds and restore inventory
6. **generateInvoicePDF** - Generate PDF invoices using pdfkit

### Firestore Triggers

7. **updateLoyaltyPoints** - Award loyalty points on order completion
8. **notifyKitchen** - Send FCM notifications to kitchen on new orders
9. **sendPushNotification** - Generic push notification sender
10. **updateMenuItemRating** - Update ratings on review creation/update/deletion

### Scheduled Functions

11. **nightlyReports** - Generate daily reports (runs at midnight IST)
12. **cleanupExpiredCoupons** - Deactivate expired coupons (runs at 2 AM IST)

### Auth Triggers

13. **onUserCreate** - Initialize user document and send welcome email

## Environment Variables

Required environment variables:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@restaurant-platform.com

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

Set environment variables:
```bash
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set razorpay.key_id="your-key"
# ... etc
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode
npm run build:watch

# Run locally with emulator
npm run serve

# Deploy to Firebase
npm run deploy

# View logs
npm run logs
```

## Features

- ✅ Full TypeScript strict mode
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Authentication checks
- ✅ CORS support for HTTP functions
- ✅ JSDoc comments
- ✅ Shared type definitions
- ✅ Pricing calculations with GST
- ✅ Inventory management
- ✅ Multi-gateway payment support
- ✅ PDF invoice generation
- ✅ FCM notifications
- ✅ Email notifications
- ✅ Loyalty points system
- ✅ Rating aggregation
- ✅ Scheduled reports
- ✅ Automated cleanup tasks

## Testing

All functions include:
- Authentication verification
- Input validation
- Error logging
- Transaction safety
- Graceful error handling

## Security

- All HTTP functions require authentication (except webhooks)
- Admin functions check user roles
- Webhook signatures are verified
- Sensitive operations use Firestore transactions
- Input sanitization prevents injection attacks
