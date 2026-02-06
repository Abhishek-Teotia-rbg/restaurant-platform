import { messaging } from './admin';

/**
 * Send FCM notification to a user
 */
export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const message = {
      topic: `user_${userId}`,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    await messaging.send(message);
    console.log(`Notification sent to user ${userId}`);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification to kitchen staff
 */
export async function sendKitchenNotification(
  restaurantId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const message = {
      topic: `kitchen_${restaurantId}`,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
      },
    };

    await messaging.send(message);
    console.log(`Kitchen notification sent for restaurant ${restaurantId}`);
  } catch (error) {
    console.error('Error sending kitchen notification:', error);
    throw error;
  }
}

/**
 * Send notification to delivery staff
 */
export async function sendDeliveryNotification(
  deliveryPartnerId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const message = {
      topic: `delivery_${deliveryPartnerId}`,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high' as const,
      },
    };

    await messaging.send(message);
    console.log(`Delivery notification sent to ${deliveryPartnerId}`);
  } catch (error) {
    console.error('Error sending delivery notification:', error);
    throw error;
  }
}

/**
 * Send notification to multiple users
 */
export async function sendBatchNotifications(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    const messages = userIds.map(userId => ({
      topic: `user_${userId}`,
      notification: {
        title,
        body,
      },
      data: data || {},
    }));

    await messaging.sendEach(messages);
    console.log(`Batch notifications sent to ${userIds.length} users`);
  } catch (error) {
    console.error('Error sending batch notifications:', error);
    throw error;
  }
}
