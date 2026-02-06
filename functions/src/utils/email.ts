import * as nodemailer from 'nodemailer';

/**
 * Email transporter configuration
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{ filename: string; content: Buffer }>
): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@restaurant-platform.com',
      to,
      subject,
      html,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  total: number
): Promise<void> {
  const subject = `Order Confirmation - ${orderNumber}`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Order Confirmed!</h2>
        <p>Thank you for your order.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
        <p>We'll notify you once your order is ready.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply.
        </p>
      </body>
    </html>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Send invoice email with PDF attachment
 */
export async function sendInvoiceEmail(
  email: string,
  orderNumber: string,
  pdfBuffer: Buffer
): Promise<void> {
  const subject = `Invoice - ${orderNumber}`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Invoice</h2>
        <p>Please find attached the invoice for your order ${orderNumber}.</p>
        <p>Thank you for your business!</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply.
        </p>
      </body>
    </html>
  `;

  const attachments = [
    {
      filename: `invoice-${orderNumber}.pdf`,
      content: pdfBuffer,
    },
  ];

  await sendEmail(email, subject, html, attachments);
}

/**
 * Send refund confirmation email
 */
export async function sendRefundConfirmationEmail(
  email: string,
  orderNumber: string,
  refundAmount: number
): Promise<void> {
  const subject = `Refund Processed - ${orderNumber}`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Refund Processed</h2>
        <p>Your refund has been processed successfully.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>
        <p>The amount will be credited to your original payment method within 5-7 business days.</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply.
        </p>
      </body>
    </html>
  `;

  await sendEmail(email, subject, html);
}

/**
 * Send daily report email
 */
export async function sendDailyReportEmail(
  email: string,
  date: string,
  reportData: {
    totalOrders: number;
    totalRevenue: number;
    topItems: Array<{ name: string; count: number }>;
  }
): Promise<void> {
  const subject = `Daily Report - ${date}`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>Daily Report - ${date}</h2>
        <h3>Summary</h3>
        <ul>
          <li><strong>Total Orders:</strong> ${reportData.totalOrders}</li>
          <li><strong>Total Revenue:</strong> ₹${reportData.totalRevenue.toFixed(2)}</li>
        </ul>
        <h3>Top Selling Items</h3>
        <ol>
          ${reportData.topItems.map(item => `<li>${item.name} - ${item.count} orders</li>`).join('')}
        </ol>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This is an automated email. Please do not reply.
        </p>
      </body>
    </html>
  `;

  await sendEmail(email, subject, html);
}
