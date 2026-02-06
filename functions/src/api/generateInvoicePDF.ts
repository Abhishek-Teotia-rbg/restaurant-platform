import * as functions from 'firebase-functions';
import cors from 'cors';
import PDFDocument from 'pdfkit';
import { db } from '../utils/admin';
import { sendInvoiceEmail } from '../utils/email';
import { Order, User, Restaurant } from '../../../shared/types/index';

const corsHandler = cors({ origin: true });

/**
 * HTTP function to generate PDF invoice
 */
export const generateInvoicePDF = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== 'GET' && req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const orderId = req.query.orderId as string || req.body?.orderId;
      const sendEmail = req.query.sendEmail === 'true' || req.body?.sendEmail;

      if (!orderId) {
        res.status(400).json({ error: 'Order ID required' });
        return;
      }

      // Get order
      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      const order = orderDoc.data() as Order;

      // Get user details
      const userDoc = await db.collection('users').doc(order.userId).get();
      if (!userDoc.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const user = userDoc.data() as User;

      // Get restaurant details
      const restaurantDoc = await db.collection('restaurants').doc(order.restaurantId).get();
      if (!restaurantDoc.exists) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      const restaurant = restaurantDoc.data() as Restaurant;

      // Generate PDF
      const pdfBuffer = await generatePDF(order, user, restaurant);

      if (sendEmail && user.email) {
        // Send invoice via email
        try {
          await sendInvoiceEmail(user.email, order.orderNumber, pdfBuffer);
          res.status(200).json({
            success: true,
            message: 'Invoice sent to email',
          });
        } catch (emailError) {
          console.error('Error sending invoice email:', emailError);
          res.status(500).json({ error: 'Failed to send email' });
        }
      } else {
        // Return PDF directly
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=invoice-${order.orderNumber}.pdf`
        );
        res.send(pdfBuffer);
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
});

/**
 * Generate PDF invoice
 */
async function generatePDF(
  order: Order,
  user: User,
  restaurant: Restaurant
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text(restaurant.name, 50, 50)
        .fontSize(10)
        .text(restaurant.address, 50, 80)
        .text(`Phone: ${restaurant.phone}`, 50, 95)
        .text(`Email: ${restaurant.email}`, 50, 110)
        .text(`GST: ${restaurant.gst}`, 50, 125)
        .text(`FSSAI: ${restaurant.fssai}`, 50, 140);

      // Invoice title
      doc
        .fontSize(16)
        .text('INVOICE', 400, 50)
        .fontSize(10)
        .text(`Invoice No: ${order.orderNumber}`, 400, 80)
        .text(
          `Date: ${order.createdAt.toDate().toLocaleDateString()}`,
          400,
          95
        )
        .text(`Payment Status: ${order.paymentStatus}`, 400, 110);

      // Customer details
      doc
        .fontSize(12)
        .text('Bill To:', 50, 180)
        .fontSize(10)
        .text(user.name, 50, 200)
        .text(user.email, 50, 215)
        .text(user.phone, 50, 230);

      if (order.deliveryAddress) {
        doc.text(order.deliveryAddress.address, 50, 245);
      }

      // Line
      doc
        .moveTo(50, 280)
        .lineTo(550, 280)
        .stroke();

      // Table header
      doc
        .fontSize(10)
        .text('Item', 50, 300)
        .text('Qty', 300, 300)
        .text('Price', 370, 300)
        .text('Amount', 470, 300);

      doc
        .moveTo(50, 315)
        .lineTo(550, 315)
        .stroke();

      // Items
      let yPosition = 330;
      order.items.forEach((item) => {
        doc
          .fontSize(9)
          .text(item.name, 50, yPosition, { width: 240 })
          .text(item.quantity.toString(), 300, yPosition)
          .text(`₹${(item.price / item.quantity).toFixed(2)}`, 370, yPosition)
          .text(`₹${item.price.toFixed(2)}`, 470, yPosition);

        if (item.variant) {
          yPosition += 15;
          doc
            .fontSize(8)
            .fillColor('#666')
            .text(`Variant: ${item.variant}`, 70, yPosition);
          doc.fillColor('#000');
        }

        if (item.addons && item.addons.length > 0) {
          yPosition += 15;
          doc
            .fontSize(8)
            .fillColor('#666')
            .text(`Addons: ${item.addons.join(', ')}`, 70, yPosition);
          doc.fillColor('#000');
        }

        yPosition += 25;
      });

      // Summary
      yPosition += 20;
      doc
        .moveTo(50, yPosition)
        .lineTo(550, yPosition)
        .stroke();

      yPosition += 15;
      doc
        .fontSize(10)
        .text('Subtotal:', 370, yPosition)
        .text(`₹${order.subtotal.toFixed(2)}`, 470, yPosition);

      if (order.discount > 0) {
        yPosition += 20;
        doc
          .text('Discount:', 370, yPosition)
          .fillColor('#0a0')
          .text(`-₹${order.discount.toFixed(2)}`, 470, yPosition)
          .fillColor('#000');
      }

      if (order.deliveryCharge > 0) {
        yPosition += 20;
        doc
          .text('Delivery Charge:', 370, yPosition)
          .text(`₹${order.deliveryCharge.toFixed(2)}`, 470, yPosition);
      }

      yPosition += 20;
      doc
        .text('GST (18%):', 370, yPosition)
        .text(`₹${order.gst.toFixed(2)}`, 470, yPosition);

      yPosition += 20;
      doc
        .moveTo(370, yPosition)
        .lineTo(550, yPosition)
        .stroke();

      yPosition += 15;
      doc
        .fontSize(12)
        .text('Total:', 370, yPosition)
        .text(`₹${order.total.toFixed(2)}`, 470, yPosition);

      // Footer
      doc
        .fontSize(8)
        .fillColor('#666')
        .text(
          'Thank you for your business!',
          50,
          700,
          { align: 'center', width: 500 }
        )
        .text(
          'This is a computer-generated invoice and does not require a signature.',
          50,
          715,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
