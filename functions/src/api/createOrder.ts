import * as functions from 'firebase-functions';
import cors from 'cors';
import { db, auth, admin } from '../utils/admin';
import {
  validateOrderItems,
  isValidOrderType,
  sanitizeString,
} from '../utils/validators';
import {
  calculateOrderSubtotal,
  calculateDeliveryCharge,
  calculateOrderTotal,
  calculateDistance,
} from '../utils/pricing';
import { sendKitchenNotification } from '../utils/notifications';
import { sendOrderConfirmationEmail } from '../utils/email';
import { OrderItem, Order, MenuItem } from '../../../shared/types/index';

const corsHandler = cors({ origin: true });

/**
 * HTTP function to create a new order
 * Validates items, calculates pricing, deducts inventory, and creates order document
 */
export const createOrder = functions.https.onRequest(async (req, res) => {
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

      // Parse request body
      const {
        restaurantId,
        items,
        orderType,
        deliveryAddress,
        tableNumber,
        scheduledFor,
        notes,
        couponCode,
      } = req.body;

      // Validate required fields
      if (!restaurantId || !items || !orderType) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Validate order type
      if (!isValidOrderType(orderType)) {
        res.status(400).json({ error: 'Invalid order type' });
        return;
      }

      // Validate items
      const itemValidation = validateOrderItems(items);
      if (!itemValidation.valid) {
        res.status(400).json({ error: itemValidation.error });
        return;
      }

      // Get restaurant details
      const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
      if (!restaurantDoc.exists) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      const restaurant = restaurantDoc.data();

      // Check if restaurant is open
      if (!restaurant?.isOpen) {
        res.status(400).json({ error: 'Restaurant is closed' });
        return;
      }

      // Validate delivery address if order type is delivery
      if (orderType === 'delivery') {
        if (!deliveryAddress) {
          res.status(400).json({ error: 'Delivery address required' });
          return;
        }

        // Check delivery radius
        const distance = calculateDistance(
          restaurant.coordinates.latitude,
          restaurant.coordinates.longitude,
          deliveryAddress.coordinates.latitude,
          deliveryAddress.coordinates.longitude
        );

        if (distance > restaurant.deliveryRadius) {
          res.status(400).json({ error: 'Address outside delivery radius' });
          return;
        }
      }

      // Validate table number for dine-in
      if (orderType === 'dine-in' && !tableNumber) {
        res.status(400).json({ error: 'Table number required for dine-in' });
        return;
      }

      // Validate and update inventory
      const batch = db.batch();
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const menuItemDoc = await db.collection('menuItems').doc(item.menuItemId).get();
        if (!menuItemDoc.exists) {
          res.status(404).json({ error: `Menu item ${item.menuItemId} not found` });
          return;
        }

        const menuItem = menuItemDoc.data() as MenuItem;

        // Check if item is available
        if (!menuItem.available) {
          res.status(400).json({ error: `Item ${menuItem.name} is not available` });
          return;
        }

        // Deduct inventory for linked items
        if (menuItem.id) {
          const inventoryQuery = await db
            .collection('inventory')
            .where('linkedMenuItems', 'array-contains', menuItem.id)
            .get();

          for (const inventoryDoc of inventoryQuery.docs) {
            const inventory = inventoryDoc.data();
            const newStock = inventory.currentStock - item.quantity;

            if (newStock < 0) {
              res.status(400).json({ 
                error: `Insufficient stock for ${menuItem.name}` 
              });
              return;
            }

            batch.update(inventoryDoc.ref, { currentStock: newStock });
          }
        }

        orderItems.push({
          menuItemId: item.menuItemId,
          name: menuItem.name,
          quantity: item.quantity,
          variant: item.variant || undefined,
          addons: item.addons || [],
          price: item.price,
          specialInstructions: item.specialInstructions 
            ? sanitizeString(item.specialInstructions) 
            : undefined,
        });
      }

      // Calculate pricing
      const subtotal = await calculateOrderSubtotal(orderItems);

      // Check minimum order value
      if (subtotal < restaurant.minOrderValue) {
        res.status(400).json({
          error: `Minimum order value is ₹${restaurant.minOrderValue}`,
        });
        return;
      }

      // Calculate delivery charge
      let deliveryCharge = 0;
      if (orderType === 'delivery' && deliveryAddress) {
        const distance = calculateDistance(
          restaurant.coordinates.latitude,
          restaurant.coordinates.longitude,
          deliveryAddress.coordinates.latitude,
          deliveryAddress.coordinates.longitude
        );
        deliveryCharge = calculateDeliveryCharge(distance, orderType);
      }

      // Apply coupon if provided
      let discount = 0;
      if (couponCode) {
        const couponDoc = await db
          .collection('coupons')
          .where('code', '==', couponCode)
          .where('isActive', '==', true)
          .limit(1)
          .get();

        if (!couponDoc.empty) {
          // Coupon validation and discount calculation handled in applyCoupon function
          // For now, set discount to 0 if coupon exists but needs validation
          discount = 0;
        }
      }

      const pricing = calculateOrderTotal(subtotal, discount, deliveryCharge);

      // Generate order number
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create order document
      const orderData: Partial<Order> = {
        orderNumber,
        userId,
        restaurantId,
        items: orderItems,
        orderType: orderType as 'delivery' | 'pickup' | 'dine-in',
        tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        scheduledFor: scheduledFor 
          ? admin.firestore.Timestamp.fromDate(new Date(scheduledFor)) 
          : undefined,
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: admin.firestore.Timestamp.now(),
          },
        ],
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        couponCode: couponCode || undefined,
        deliveryCharge: pricing.deliveryCharge,
        gst: pricing.gst,
        total: pricing.total,
        paymentMethod: 'pending',
        paymentStatus: 'pending',
        notes: notes ? sanitizeString(notes) : undefined,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      const orderRef = db.collection('orders').doc();
      batch.set(orderRef, orderData);

      // Commit all changes
      await batch.commit();

      // Send notifications
      try {
        await sendKitchenNotification(
          restaurantId,
          'New Order',
          `Order ${orderNumber} received`,
          { orderId: orderRef.id, orderNumber }
        );

        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data()?.email) {
          await sendOrderConfirmationEmail(
            userDoc.data()?.email,
            orderNumber,
            pricing.total
          );
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        // Continue even if notification fails
      }

      res.status(201).json({
        success: true,
        orderId: orderRef.id,
        orderNumber,
        pricing,
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});
