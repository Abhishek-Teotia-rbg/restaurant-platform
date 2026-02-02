import * as functions from 'firebase-functions';
import { admin } from '../utils/admin';
import { sendNotificationToUser } from '../utils/notifications';

/**
 * Firestore trigger to send push notifications
 * Listens to notifications collection
 */
export const sendPushNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    try {
      const notification = snapshot.data();

      const { userId, title, body, data } = notification;

      if (!userId || !title || !body) {
        console.error('Invalid notification data');
        return null;
      }

      // Send notification to user
      await sendNotificationToUser(userId, title, body, data || {});

      // Mark notification as sent
      await snapshot.ref.update({
        sent: true,
        sentAt: admin.firestore.Timestamp.now(),
      });

      console.log(
        `Notification sent to user ${userId}: ${title}`
      );

      return null;
    } catch (error) {
      console.error('Error sending push notification:', error);

      // Mark notification as failed
      try {
        await snapshot.ref.update({
          sent: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          attemptedAt: admin.firestore.Timestamp.now(),
        });
      } catch (updateError) {
        console.error('Error updating notification status:', updateError);
      }

      return null;
    }
  });
