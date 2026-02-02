import * as functions from 'firebase-functions';
import { sendKitchenNotification } from '../utils/notifications';
import { Order } from '../../../shared/types/index';

/**
 * Firestore trigger to notify kitchen on new order
 */
export const notifyKitchen = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    try {
      const order = snapshot.data() as Order;

      // Send notification to kitchen staff
      await sendKitchenNotification(
        order.restaurantId,
        'New Order Received',
        `Order ${order.orderNumber} - ${order.items.length} items - ${order.orderType}`,
        {
          orderId: context.params.orderId,
          orderNumber: order.orderNumber,
          orderType: order.orderType,
          itemCount: order.items.length.toString(),
        }
      );

      console.log(
        `Kitchen notification sent for order ${order.orderNumber} to restaurant ${order.restaurantId}`
      );

      return null;
    } catch (error) {
      console.error('Error sending kitchen notification:', error);
      return null;
    }
  });
