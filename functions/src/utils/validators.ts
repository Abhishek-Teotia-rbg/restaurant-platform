import { OrderItem } from '../../../shared/types/index';

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates order items
 */
export function validateOrderItems(items: OrderItem[]): { valid: boolean; error?: string } {
  if (!items || items.length === 0) {
    return { valid: false, error: 'Order must contain at least one item' };
  }

  for (const item of items) {
    if (!item.menuItemId || !item.name) {
      return { valid: false, error: 'Invalid item data' };
    }
    if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      return { valid: false, error: 'Invalid quantity' };
    }
    if (item.price < 0) {
      return { valid: false, error: 'Invalid price' };
    }
  }

  return { valid: true };
}

/**
 * Validates coupon code format
 */
export function isValidCouponCode(code: string): boolean {
  return /^[A-Z0-9]{4,20}$/.test(code);
}

/**
 * Validates amount
 */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && Number.isFinite(amount);
}

/**
 * Validates order type
 */
export function isValidOrderType(type: string): boolean {
  return ['delivery', 'pickup', 'dine-in'].includes(type);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength = 500): string {
  return input.trim().substring(0, maxLength);
}

/**
 * Validates coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}
