import * as functions from 'firebase-functions';
import { db, admin } from '../utils/admin';
import { sendDailyReportEmail } from '../utils/email';
import { Order } from '../../../shared/types/index';

/**
 * Scheduled function to generate and send nightly reports
 * Runs every day at midnight IST
 */
export const nightlyReports = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    try {
      console.log('Starting nightly reports generation...');

      // Get yesterday's date range
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all restaurants
      const restaurantsSnapshot = await db.collection('restaurants').get();

      for (const restaurantDoc of restaurantsSnapshot.docs) {
        const restaurantId = restaurantDoc.id;
        const restaurant = restaurantDoc.data();

        // Get yesterday's orders
        const ordersSnapshot = await db
          .collection('orders')
          .where('restaurantId', '==', restaurantId)
          .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
          .where('createdAt', '<', admin.firestore.Timestamp.fromDate(today))
          .get();

        const orders = ordersSnapshot.docs.map((doc) => doc.data() as Order);

        // Calculate metrics
        const totalOrders = orders.length;
        const totalRevenue = orders
          .filter((o) => o.paymentStatus === 'completed')
          .reduce((sum, order) => sum + order.total, 0);

        // Calculate top selling items
        const itemCounts: Record<string, { name: string; count: number }> = {};

        orders.forEach((order) => {
          order.items.forEach((item) => {
            if (!itemCounts[item.menuItemId]) {
              itemCounts[item.menuItemId] = { name: item.name, count: 0 };
            }
            itemCounts[item.menuItemId].count += item.quantity;
          });
        });

        const topItems = Object.values(itemCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Calculate other metrics
        const completedOrders = orders.filter(
          (o) => o.status === 'delivered'
        ).length;
        const cancelledOrders = orders.filter(
          (o) => o.status === 'cancelled'
        ).length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Store report in Firestore
        await db.collection('reports').add({
          restaurantId,
          type: 'daily',
          date: admin.firestore.Timestamp.fromDate(yesterday),
          metrics: {
            totalOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue,
            avgOrderValue,
          },
          topItems,
          createdAt: admin.firestore.Timestamp.now(),
        });

        // Send email to restaurant admin
        if (restaurant.email) {
          try {
            await sendDailyReportEmail(
              restaurant.email,
              yesterday.toLocaleDateString(),
              {
                totalOrders,
                totalRevenue,
                topItems,
              }
            );
          } catch (emailError) {
            console.error(
              `Error sending report email to ${restaurant.email}:`,
              emailError
            );
          }
        }

        console.log(`Report generated for restaurant ${restaurantId}`);
      }

      // Generate platform-wide report
      const allOrdersSnapshot = await db
        .collection('orders')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(today))
        .get();

      const allOrders = allOrdersSnapshot.docs.map((doc) => doc.data() as Order);
      const platformRevenue = allOrders
        .filter((o) => o.paymentStatus === 'completed')
        .reduce((sum, order) => sum + order.total, 0);

      await db.collection('reports').add({
        type: 'platform_daily',
        date: admin.firestore.Timestamp.fromDate(yesterday),
        metrics: {
          totalOrders: allOrders.length,
          totalRevenue: platformRevenue,
          totalRestaurants: restaurantsSnapshot.size,
        },
        createdAt: admin.firestore.Timestamp.now(),
      });

      console.log('Nightly reports generation completed');
      return null;
    } catch (error) {
      console.error('Error generating nightly reports:', error);
      return null;
    }
  });
