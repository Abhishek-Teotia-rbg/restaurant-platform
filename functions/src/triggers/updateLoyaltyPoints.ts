import * as functions from 'firebase-functions';
import { db, admin } from '../utils/admin';
import { sendNotificationToUser } from '../utils/notifications';
import { Order } from '../../../shared/types/index';

/**
 * Firestore trigger to update loyalty points on order completion
 */
export const updateLoyaltyPoints = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data() as Order;
      const after = change.after.data() as Order;

      // Check if order status changed to delivered or completed
      if (
        before.status !== 'delivered' &&
        after.status === 'delivered' &&
        after.paymentStatus === 'completed'
      ) {
        const userId = after.userId;
        const orderTotal = after.total;

        // Calculate loyalty points (1 point per ₹100 spent)
        const pointsEarned = Math.floor(orderTotal / 100);

        if (pointsEarned > 0) {
          // Update user's loyalty points
          await db.collection('users').doc(userId).update({
            loyaltyPoints: admin.firestore.FieldValue.increment(pointsEarned),
          });

          console.log(
            `Added ${pointsEarned} loyalty points to user ${userId} for order ${context.params.orderId}`
          );

          // Send notification
          try {
            await sendNotificationToUser(
              userId,
              'Loyalty Points Earned!',
              `You earned ${pointsEarned} loyalty points from your recent order`,
              { 
                orderId: context.params.orderId, 
                points: pointsEarned.toString() 
              }
            );
          } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
          }

          // Create loyalty transaction record
          await db.collection('loyaltyTransactions').add({
            userId,
            orderId: context.params.orderId,
            points: pointsEarned,
            type: 'earned',
            description: `Order ${after.orderNumber}`,
            timestamp: admin.firestore.Timestamp.now(),
          });
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating loyalty points:', error);
      return null;
    }
  });
