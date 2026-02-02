import { OrderItem, MenuItem, Coupon } from '../../../shared/types/index';
import { db } from './admin';

/**
 * GST rate (18%)
 */
const GST_RATE = 0.18;

/**
 * Calculate item price including variant and addons
 */
export function calculateItemPrice(
  item: OrderItem,
  menuItem: MenuItem
): number {
  let price = menuItem.basePrice;

  // Add variant price if selected
  if (item.variant) {
    const variant = menuItem.variants.find(v => v.name === item.variant);
    if (variant) {
      price = variant.price;
    }
  }

  // Add addon prices
  if (item.addons && item.addons.length > 0) {
    for (const addonName of item.addons) {
      const addon = menuItem.addons.find(a => a.name === addonName);
      if (addon) {
        price += addon.price;
      }
    }
  }

  return price * item.quantity;
}

/**
 * Calculate order subtotal
 */
export async function calculateOrderSubtotal(
  items: OrderItem[]
): Promise<number> {
  let subtotal = 0;

  for (const item of items) {
    const menuItemDoc = await db.collection('menuItems').doc(item.menuItemId).get();
    if (!menuItemDoc.exists) {
      throw new Error(`Menu item ${item.menuItemId} not found`);
    }

    const menuItem = menuItemDoc.data() as MenuItem;
    subtotal += calculateItemPrice(item, menuItem);
  }

  return Math.round(subtotal * 100) / 100;
}

/**
 * Calculate delivery charge based on distance
 */
export function calculateDeliveryCharge(
  distanceKm: number,
  orderType: string
): number {
  if (orderType !== 'delivery') {
    return 0;
  }

  const baseCharge = 30;
  const perKmCharge = 10;

  const charge = baseCharge + (distanceKm * perKmCharge);
  return Math.round(charge * 100) / 100;
}

/**
 * Calculate GST
 */
export function calculateGST(subtotal: number): number {
  return Math.round(subtotal * GST_RATE * 100) / 100;
}

/**
 * Calculate discount from coupon
 */
export function calculateCouponDiscount(
  coupon: Coupon,
  subtotal: number
): number {
  let discount = 0;

  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return Math.round(discount * 100) / 100;
}

/**
 * Calculate order total
 */
export interface OrderPricing {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  gst: number;
  total: number;
}

export function calculateOrderTotal(
  subtotal: number,
  discount: number,
  deliveryCharge: number
): OrderPricing {
  const afterDiscount = subtotal - discount;
  const gst = calculateGST(afterDiscount);
  const total = afterDiscount + deliveryCharge + gst;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    deliveryCharge: Math.round(deliveryCharge * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
