import * as functions from 'firebase-functions';
import cors from 'cors';
import { db, auth, admin } from '../utils/admin';
import { sendNotificationToUser } from '../utils/notifications';
import { sendRefundConfirmationEmail } from '../utils/email';
import { Order } from '../../../shared/types/index';

const corsHandler = cors({ origin: true });

/**
 * HTTP function to process refunds
 */
export const issueRefund = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      // Verify authentication and admin role
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

      // Check if user is admin
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
      }

      const { orderId, refundAmount } = req.body;

      // Validate input
      if (!orderId || !refundAmount) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (refundAmount <= 0) {
        res.status(400).json({ error: 'Invalid refund amount' });
        return;
      }

      // Get order
      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const order = orderDoc.data() as Order;

      // Check if order can be refunded
      if (order.paymentStatus !== 'completed') {
        res.status(400).json({ error: 'Order payment not completed' });
        return;
      }

      // Validate refund amount
      if (refundAmount > order.total) {
        res.status(400).json({ 
          error: 'Refund amount cannot exceed order total' 
        });
        return;
      }

      // Process refund based on payment method
      let refundSuccess = false;
      let refundId = '';

      if (order.paymentMethod === 'razorpay') {
        refundSuccess = await processRazorpayRefund(
          order.paymentId || '',
          refundAmount
        );
        refundId = `razorpay_refund_${Date.now()}`;
      } else if (order.paymentMethod === 'stripe') {
        refundSuccess = await processStripeRefund(
          order.paymentId || '',
          refundAmount
        );
        refundId = `stripe_refund_${Date.now()}`;
      } else {
        // For other payment methods, mark as refunded directly
        refundSuccess = true;
        refundId = `manual_refund_${Date.now()}`;
      }

      if (!refundSuccess) {
        res.status(500).json({ error: 'Failed to process refund' });
        return;
      }

      // Update order
      await orderDoc.ref.update({
        paymentStatus: 'refunded',
        refundAmount,
        status: 'cancelled',
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          status: 'cancelled',
          timestamp: admin.firestore.Timestamp.now(),
        }),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      // Credit wallet if partial refund
      if (refundAmount < order.total) {
        const walletAmount = refundAmount;
        await db.collection('users').doc(order.userId).update({
          'wallet.balance': admin.firestore.FieldValue.increment(walletAmount),
          'wallet.transactions': admin.firestore.FieldValue.arrayUnion({
            id: refundId,
            type: 'credit',
            amount: walletAmount,
            description: `Refund for order ${order.orderNumber}`,
            timestamp: admin.firestore.Timestamp.now(),
          }),
        });
      }

      // Restore inventory
      for (const item of order.items) {
        const inventoryQuery = await db
          .collection('inventory')
          .where('linkedMenuItems', 'array-contains', item.menuItemId)
          .get();

        for (const inventoryDoc of inventoryQuery.docs) {
          await inventoryDoc.ref.update({
            currentStock: admin.firestore.FieldValue.increment(item.quantity),
          });
        }
      }

      // Send notifications
      try {
        await sendNotificationToUser(
          order.userId,
          'Refund Processed',
          `Refund of ₹${refundAmount} processed for order ${order.orderNumber}`,
          { orderId, orderNumber: order.orderNumber }
        );

        const userDocData = await db.collection('users').doc(order.userId).get();
        if (userDocData.exists && userDocData.data()?.email) {
          await sendRefundConfirmationEmail(
            userDocData.data()?.email,
            order.orderNumber,
            refundAmount
          );
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
      }

      res.status(200).json({
        success: true,
        refundId,
        message: 'Refund processed successfully',
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});

/**
 * Process Razorpay refund
 */
async function processRazorpayRefund(
  paymentId: string,
  amount: number
): Promise<boolean> {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // Amount in paise
    });

    return true;
  } catch (error) {
    console.error('Razorpay refund error:', error);
    return false;
  }
}

/**
 * Process Stripe refund
 */
async function processStripeRefund(
  paymentId: string,
  amount: number
): Promise<boolean> {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    await stripe.refunds.create({
      payment_intent: paymentId,
      amount: Math.round(amount * 100), // Amount in cents
    });

    return true;
  } catch (error) {
    console.error('Stripe refund error:', error);
    return false;
  }
}
