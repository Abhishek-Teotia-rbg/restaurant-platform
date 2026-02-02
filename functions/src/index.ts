/**
 * Cloud Functions for Restaurant Platform
 * 
 * This file exports all HTTP and trigger functions for the platform
 */

// API Functions (HTTP)
export { createOrder } from './api/createOrder';
export { validateOrderPricing } from './api/validateOrderPricing';
export { applyCoupon } from './api/applyCoupon';
export { paymentWebhook } from './api/paymentWebhook';
export { issueRefund } from './api/issueRefund';
export { generateInvoicePDF } from './api/generateInvoicePDF';

// Firestore Triggers
export { updateLoyaltyPoints } from './triggers/updateLoyaltyPoints';
export { notifyKitchen } from './triggers/notifyKitchen';
export { sendPushNotification } from './triggers/sendPushNotification';
export { 
  updateMenuItemRating,
  updateMenuItemRatingOnEdit,
  updateMenuItemRatingOnDelete,
} from './triggers/updateMenuItemRating';

// Scheduled Functions
export { nightlyReports } from './triggers/nightlyReports';
export { cleanupExpiredCoupons } from './triggers/cleanupExpiredCoupons';

// Auth Triggers
export { onUserCreate } from './triggers/onUserCreate';
