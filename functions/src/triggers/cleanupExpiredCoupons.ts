import * as functions from 'firebase-functions';
import { db, admin } from '../utils/admin';
import { Coupon } from '../../../shared/types/index';

/**
 * Scheduled function to cleanup expired coupons
 * Runs every day at 2 AM IST
 */
export const cleanupExpiredCoupons = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    try {
      console.log('Starting expired coupons cleanup...');

      const now = admin.firestore.Timestamp.now();

      // Find expired active coupons
      const expiredCouponsSnapshot = await db
        .collection('coupons')
        .where('isActive', '==', true)
        .where('validTo', '<', now)
        .get();

      if (expiredCouponsSnapshot.empty) {
        console.log('No expired coupons found');
        return null;
      }

      // Batch update to deactivate expired coupons
      const batch = db.batch();
      let count = 0;

      expiredCouponsSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
          deactivatedAt: now,
          deactivationReason: 'expired',
        });
        count++;
      });

      await batch.commit();

      console.log(`Deactivated ${count} expired coupons`);

      // Log cleanup activity
      await db.collection('systemLogs').add({
        type: 'coupon_cleanup',
        count,
        timestamp: now,
        details: 'Expired coupons cleanup completed',
      });

      // Find coupons that reached usage limit
      const fullyCouponsSnapshot = await db
        .collection('coupons')
        .where('isActive', '==', true)
        .get();

      const fullyUsedBatch = db.batch();
      let fullyUsedCount = 0;

      fullyCouponsSnapshot.docs.forEach((doc) => {
        const coupon = doc.data() as Coupon;
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
          fullyUsedBatch.update(doc.ref, {
            isActive: false,
            deactivatedAt: now,
            deactivationReason: 'usage_limit_reached',
          });
          fullyUsedCount++;
        }
      });

      if (fullyUsedCount > 0) {
        await fullyUsedBatch.commit();
        console.log(`Deactivated ${fullyUsedCount} fully used coupons`);
      }

      return null;
    } catch (error) {
      console.error('Error cleaning up expired coupons:', error);
      return null;
    }
  });
