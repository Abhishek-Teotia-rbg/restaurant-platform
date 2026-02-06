import * as functions from 'firebase-functions';
import cors from 'cors';
import { db } from '../utils/admin';
import {
  calculateOrderSubtotal,
  calculateDeliveryCharge,
  calculateOrderTotal,
  calculateDistance,
  calculateCouponDiscount,
} from '../utils/pricing';
import { OrderItem, Coupon } from '../../../shared/types/index';

const corsHandler = cors({ origin: true });

/**
 * HTTP function to validate order pricing
 * Ensures client-side calculated prices match server-side calculation
 */
export const validateOrderPricing = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const {
        restaurantId,
        items,
        orderType,
        deliveryAddress,
        clientPricing,
        couponCode,
      } = req.body;

      // Validate required fields
      if (!restaurantId || !items || !orderType || !clientPricing) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Get restaurant details
      const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
      if (!restaurantDoc.exists) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      const restaurant = restaurantDoc.data();

      // Calculate server-side subtotal
      const serverSubtotal = await calculateOrderSubtotal(items as OrderItem[]);

      // Calculate delivery charge
      let serverDeliveryCharge = 0;
      if (orderType === 'delivery' && deliveryAddress && restaurant) {
        const distance = calculateDistance(
          restaurant.coordinates.latitude,
          restaurant.coordinates.longitude,
          deliveryAddress.coordinates.latitude,
          deliveryAddress.coordinates.longitude
        );
        serverDeliveryCharge = calculateDeliveryCharge(distance, orderType);
      }

      // Calculate discount
      let serverDiscount = 0;
      if (couponCode) {
        const couponQuery = await db
          .collection('coupons')
          .where('code', '==', couponCode)
          .where('isActive', '==', true)
          .limit(1)
          .get();

        if (!couponQuery.empty) {
          const coupon = couponQuery.docs[0].data() as Coupon;
          const now = Date.now();
          const validFrom = coupon.validFrom.toDate().getTime();
          const validTo = coupon.validTo.toDate().getTime();

          if (now >= validFrom && now <= validTo) {
            if (serverSubtotal >= coupon.minOrderValue) {
              serverDiscount = calculateCouponDiscount(coupon, serverSubtotal);
            }
          }
        }
      }

      // Calculate server-side total
      const serverPricing = calculateOrderTotal(
        serverSubtotal,
        serverDiscount,
        serverDeliveryCharge
      );

      // Compare with client pricing (allow 1 rupee tolerance for rounding)
      const tolerance = 1.0;
      const differences = {
        subtotal: Math.abs(serverPricing.subtotal - clientPricing.subtotal),
        discount: Math.abs(serverPricing.discount - clientPricing.discount),
        deliveryCharge: Math.abs(serverPricing.deliveryCharge - clientPricing.deliveryCharge),
        gst: Math.abs(serverPricing.gst - clientPricing.gst),
        total: Math.abs(serverPricing.total - clientPricing.total),
      };

      const isValid =
        differences.subtotal <= tolerance &&
        differences.discount <= tolerance &&
        differences.deliveryCharge <= tolerance &&
        differences.gst <= tolerance &&
        differences.total <= tolerance;

      if (!isValid) {
        res.status(400).json({
          error: 'Pricing validation failed',
          clientPricing,
          serverPricing,
          differences,
        });
        return;
      }

      res.status(200).json({
        valid: true,
        pricing: serverPricing,
        message: 'Pricing validated successfully',
      });
    } catch (error) {
      console.error('Error validating pricing:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});
