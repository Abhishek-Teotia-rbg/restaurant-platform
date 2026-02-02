import * as functions from 'firebase-functions';
import * as crypto from 'crypto';
import { db, admin } from '../utils/admin';
import { sendNotificationToUser } from '../utils/notifications';
import { Order } from '../../../shared/types/index';

/**
 * HTTP function to handle payment gateway webhooks
 * Supports Razorpay and Stripe
 */
export const paymentWebhook = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const gateway = req.query.gateway as string;

    if (gateway === 'razorpay') {
      await handleRazorpayWebhook(req, res);
    } else if (gateway === 'stripe') {
      await handleStripeWebhook(req, res);
    } else {
      res.status(400).json({ error: 'Invalid gateway' });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Handle Razorpay webhook
 */
async function handleRazorpayWebhook(
  req: functions.https.Request,
  res: functions.Response
): Promise<void> {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string;

  if (!signature) {
    res.status(400).json({ error: 'Missing signature' });
    return;
  }

  // Verify signature
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  const event = req.body.event;
  const payload = req.body.payload.payment.entity;

  console.log('Razorpay webhook event:', event);

  if (event === 'payment.captured') {
    const orderId = payload.notes?.orderId;
    if (!orderId) {
      res.status(400).json({ error: 'Order ID not found in notes' });
      return;
    }

    // Update order
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await orderRef.update({
      paymentStatus: 'completed',
      paymentId: payload.id,
      paymentMethod: 'razorpay',
      status: 'confirmed',
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        status: 'confirmed',
        timestamp: admin.firestore.Timestamp.now(),
      }),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    const order = orderDoc.data() as Order;

    // Send notification
    try {
      await sendNotificationToUser(
        order.userId,
        'Payment Successful',
        `Your payment for order ${order.orderNumber} was successful`,
        { orderId, orderNumber: order.orderNumber }
      );
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.status(200).json({ success: true });
  } else if (event === 'payment.failed') {
    const orderId = payload.notes?.orderId;
    if (orderId) {
      await db.collection('orders').doc(orderId).update({
        paymentStatus: 'failed',
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }
    res.status(200).json({ success: true });
  } else {
    res.status(200).json({ message: 'Event not handled' });
  }
}

/**
 * Handle Stripe webhook
 */
async function handleStripeWebhook(
  req: functions.https.Request,
  res: functions.Response
): Promise<void> {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const signature = req.headers['stripe-signature'] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Stripe signature verification failed:', error);
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  console.log('Stripe webhook event:', event.type);

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      res.status(400).json({ error: 'Order ID not found in metadata' });
      return;
    }

    // Update order
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await orderRef.update({
      paymentStatus: 'completed',
      paymentId: paymentIntent.id,
      paymentMethod: 'stripe',
      status: 'confirmed',
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        status: 'confirmed',
        timestamp: admin.firestore.Timestamp.now(),
      }),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    const order = orderDoc.data() as Order;

    // Send notification
    try {
      await sendNotificationToUser(
        order.userId,
        'Payment Successful',
        `Your payment for order ${order.orderNumber} was successful`,
        { orderId, orderNumber: order.orderNumber }
      );
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    res.status(200).json({ success: true });
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    if (orderId) {
      await db.collection('orders').doc(orderId).update({
        paymentStatus: 'failed',
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }
    res.status(200).json({ success: true });
  } else {
    res.status(200).json({ message: 'Event not handled' });
  }
}
