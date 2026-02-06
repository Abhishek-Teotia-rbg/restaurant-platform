import * as functions from 'firebase-functions';
import { db, admin } from '../utils/admin';
import { sendEmail } from '../utils/email';

/**
 * Auth trigger to handle new user creation
 * Sets up initial user document and sends welcome email
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    console.log(`New user created: ${user.uid}`);

    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      name: user.displayName || 'User',
      email: user.email || '',
      phone: user.phoneNumber || '',
      role: 'customer',
      photoURL: user.photoURL || '',
      addresses: [],
      wallet: {
        balance: 0,
        transactions: [],
      },
      loyaltyPoints: 0,
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now(),
    };

    await db.collection('users').doc(user.uid).set(userData);

    console.log(`User document created for ${user.uid}`);

    // Send welcome notification
    try {
      // Create welcome notification document
      await db.collection('notifications').add({
        userId: user.uid,
        title: 'Welcome to Restaurant Platform!',
        body: 'Thank you for joining us. Explore our restaurants and place your first order!',
        type: 'welcome',
        data: {
          action: 'explore_restaurants',
        },
        sent: false,
        createdAt: admin.firestore.Timestamp.now(),
      });
    } catch (notificationError) {
      console.error('Error creating welcome notification:', notificationError);
    }

    // Send welcome email
    if (user.email) {
      try {
        const welcomeEmail = `
          <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
              <h2>Welcome to Restaurant Platform!</h2>
              <p>Hi ${user.displayName || 'there'},</p>
              <p>Thank you for joining Restaurant Platform. We're excited to have you with us!</p>
              <h3>Get Started:</h3>
              <ul>
                <li>Explore restaurants in your area</li>
                <li>Browse menus and place orders</li>
                <li>Earn loyalty points with every order</li>
                <li>Track your orders in real-time</li>
              </ul>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Happy ordering!</p>
              <hr>
              <p style="font-size: 12px; color: #666;">
                This is an automated email. Please do not reply.
              </p>
            </body>
          </html>
        `;

        await sendEmail(
          user.email,
          'Welcome to Restaurant Platform!',
          welcomeEmail
        );

        console.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
      }
    }

    // Grant new user signup bonus
    const signupBonus = 50; // ₹50 welcome bonus
    await db.collection('users').doc(user.uid).update({
      'wallet.balance': signupBonus,
      'wallet.transactions': admin.firestore.FieldValue.arrayUnion({
        id: `signup_bonus_${user.uid}`,
        type: 'credit',
        amount: signupBonus,
        description: 'Welcome bonus',
        timestamp: admin.firestore.Timestamp.now(),
      }),
    });

    console.log(`Signup bonus of ₹${signupBonus} credited to ${user.uid}`);

    return null;
  } catch (error) {
    console.error('Error in onUserCreate trigger:', error);
    return null;
  }
});
