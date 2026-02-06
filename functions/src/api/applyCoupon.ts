import * as functions from 'firebase-functions';
import cors from 'cors';
import { db, auth } from '../utils/admin';
import { isValidCouponCode } from '../utils/validators';
import { calculateCouponDiscount } from '../utils/pricing';
import { Coupon } from '../../../shared/types/index';

const corsHandler = cors({ origin: true });

/**
 * HTTP function to apply and validate coupon codes
 */
export const applyCoupon = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // Verify authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      let decodedToken;
      try {
        decodedToken = await auth.verifyIdToken(token);
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      const userId = decodedToken.uid;

      const { couponCode, subtotal, items } = req.body;

      // Validate input
      if (!couponCode || !subtotal) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!isValidCouponCode(couponCode.toUpperCase())) {
        res.status(400).json({ error: 'Invalid coupon code format' });
        return;
      }

      // Find coupon
      const couponQuery = await db
        .collection('coupons')
        .where('code', '==', couponCode.toUpperCase())
        .limit(1)
        .get();

      if (couponQuery.empty) {
        res.status(404).json({ error: 'Coupon not found' });
        return;
      }

      const couponDoc = couponQuery.docs[0];
      const coupon = couponDoc.data() as Coupon;

      // Check if coupon is active
      if (!coupon.isActive) {
        res.status(400).json({ error: 'Coupon is not active' });
        return;
      }

      // Check validity dates
      const now = new Date();
      const validFrom = coupon.validFrom.toDate();
      const validTo = coupon.validTo.toDate();

      if (now < validFrom) {
        res.status(400).json({ 
          error: `Coupon is valid from ${validFrom.toLocaleDateString()}` 
        });
        return;
      }

      if (now > validTo) {
        res.status(400).json({ error: 'Coupon has expired' });
        return;
      }

      // Check usage limit
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        res.status(400).json({ error: 'Coupon usage limit reached' });
        return;
      }

      // Check per-user usage limit
      if (coupon.usagePerUser > 0) {
        const userCouponUsage = await db
          .collection('orders')
          .where('userId', '==', userId)
          .where('couponCode', '==', coupon.code)
          .where('paymentStatus', '==', 'completed')
          .get();

        if (userCouponUsage.size >= coupon.usagePerUser) {
          res.status(400).json({ 
            error: 'You have reached the usage limit for this coupon' 
          });
          return;
        }
      }

      // Check if first order only
      if (coupon.firstOrderOnly) {
        const userOrders = await db
          .collection('orders')
          .where('userId', '==', userId)
          .where('paymentStatus', '==', 'completed')
          .limit(1)
          .get();

        if (!userOrders.empty) {
          res.status(400).json({ 
            error: 'This coupon is valid for first order only' 
          });
          return;
        }
      }

      // Check minimum order value
      if (subtotal < coupon.minOrderValue) {
        res.status(400).json({
          error: `Minimum order value is ₹${coupon.minOrderValue}`,
        });
        return;
      }

      // Check applicable items/categories
      if (items && coupon.applicableTo) {
        const { categories, items: applicableItems } = coupon.applicableTo;
        
        if (categories.length > 0 || applicableItems.length > 0) {
          let hasApplicableItem = false;

          for (const item of items) {
            const menuItemDoc = await db
              .collection('menuItems')
              .doc(item.menuItemId)
              .get();

            if (menuItemDoc.exists) {
              const menuItem = menuItemDoc.data();
              
              if (
                applicableItems.includes(item.menuItemId) ||
                categories.includes(menuItem?.categoryId)
              ) {
                hasApplicableItem = true;
                break;
              }
            }
          }

          if (!hasApplicableItem) {
            res.status(400).json({ 
              error: 'This coupon is not applicable to your cart items' 
            });
            return;
          }
        }
      }

      // Calculate discount
      const discount = calculateCouponDiscount(coupon, subtotal);

      res.status(200).json({
        success: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
        },
        discount,
        message: 'Coupon applied successfully',
      });
    } catch (error) {
      console.error('Error applying coupon:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});
