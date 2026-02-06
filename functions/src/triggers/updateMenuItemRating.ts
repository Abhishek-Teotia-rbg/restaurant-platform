import * as functions from 'firebase-functions';
import { db, admin } from '../utils/admin';
import { Review, MenuItem } from '../../../shared/types/index';

/**
 * Firestore trigger to update menu item rating on new review
 */
export const updateMenuItemRating = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snapshot, context) => {
    try {
      const review = snapshot.data() as Review;
      const menuItemId = review.menuItemId;

      if (!menuItemId) {
        console.log('Review does not have menuItemId');
        return null;
      }

      // Get menu item
      const menuItemRef = db.collection('menuItems').doc(menuItemId);
      const menuItemDoc = await menuItemRef.get();

      if (!menuItemDoc.exists) {
        console.error(`Menu item ${menuItemId} not found`);
        return null;
      }

      const menuItem = menuItemDoc.data() as MenuItem;

      // Calculate new rating
      const currentRating = menuItem.rating || 0;
      const currentTotalRatings = menuItem.totalRatings || 0;
      const newTotalRatings = currentTotalRatings + 1;
      const newRating =
        (currentRating * currentTotalRatings + review.rating) / newTotalRatings;

      // Update menu item
      await menuItemRef.update({
        rating: Math.round(newRating * 10) / 10, // Round to 1 decimal
        totalRatings: newTotalRatings,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      console.log(
        `Updated rating for menu item ${menuItemId}: ${newRating} (${newTotalRatings} reviews)`
      );

      // Update restaurant rating
      await updateRestaurantRating(review.restaurantId);

      return null;
    } catch (error) {
      console.error('Error updating menu item rating:', error);
      return null;
    }
  });

/**
 * Update restaurant overall rating
 */
async function updateRestaurantRating(restaurantId: string): Promise<void> {
  try {
    // Get all menu items for the restaurant
    const menuItemsSnapshot = await db
      .collection('menuItems')
      .where('restaurantId', '==', restaurantId)
      .get();

    if (menuItemsSnapshot.empty) {
      return;
    }

    let totalRating = 0;
    let totalReviews = 0;

    menuItemsSnapshot.docs.forEach((doc) => {
      const item = doc.data() as MenuItem;
      if (item.totalRatings > 0) {
        totalRating += item.rating * item.totalRatings;
        totalReviews += item.totalRatings;
      }
    });

    if (totalReviews === 0) {
      return;
    }

    const avgRating = totalRating / totalReviews;

    // Update restaurant
    await db.collection('restaurants').doc(restaurantId).update({
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: totalReviews,
    });

    console.log(
      `Updated rating for restaurant ${restaurantId}: ${avgRating} (${totalReviews} reviews)`
    );
  } catch (error) {
    console.error('Error updating restaurant rating:', error);
  }
}

/**
 * Firestore trigger to update ratings when review is updated
 */
export const updateMenuItemRatingOnEdit = functions.firestore
  .document('reviews/{reviewId}')
  .onUpdate(async (change, context) => {
    try {
      const beforeReview = change.before.data() as Review;
      const afterReview = change.after.data() as Review;

      // Check if rating changed
      if (beforeReview.rating === afterReview.rating) {
        return null;
      }

      const menuItemId = afterReview.menuItemId;

      if (!menuItemId) {
        return null;
      }

      // Get menu item
      const menuItemRef = db.collection('menuItems').doc(menuItemId);
      const menuItemDoc = await menuItemRef.get();

      if (!menuItemDoc.exists) {
        console.error(`Menu item ${menuItemId} not found`);
        return null;
      }

      const menuItem = menuItemDoc.data() as MenuItem;

      // Recalculate rating (remove old, add new)
      const currentRating = menuItem.rating || 0;
      const totalRatings = menuItem.totalRatings || 0;
      
      if (totalRatings === 0) {
        console.error(`Menu item ${menuItemId} has zero total ratings`);
        return null;
      }
      
      const oldTotalRating = currentRating * totalRatings;
      const newTotalRating =
        oldTotalRating - beforeReview.rating + afterReview.rating;
      const newRating = newTotalRating / totalRatings;

      // Update menu item
      await menuItemRef.update({
        rating: Math.round(newRating * 10) / 10,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      console.log(
        `Updated rating for menu item ${menuItemId} after review edit: ${newRating}`
      );

      // Update restaurant rating
      await updateRestaurantRating(afterReview.restaurantId);

      return null;
    } catch (error) {
      console.error('Error updating menu item rating on edit:', error);
      return null;
    }
  });

/**
 * Firestore trigger to update ratings when review is deleted
 */
export const updateMenuItemRatingOnDelete = functions.firestore
  .document('reviews/{reviewId}')
  .onDelete(async (snapshot, context) => {
    try {
      const review = snapshot.data() as Review;
      const menuItemId = review.menuItemId;

      if (!menuItemId) {
        return null;
      }

      // Get menu item
      const menuItemRef = db.collection('menuItems').doc(menuItemId);
      const menuItemDoc = await menuItemRef.get();

      if (!menuItemDoc.exists) {
        console.error(`Menu item ${menuItemId} not found`);
        return null;
      }

      const menuItem = menuItemDoc.data() as MenuItem;

      // Recalculate rating (remove deleted review)
      const currentRating = menuItem.rating || 0;
      const currentTotalRatings = menuItem.totalRatings || 1;
      const newTotalRatings = Math.max(0, currentTotalRatings - 1);

      let newRating = 0;
      if (newTotalRatings > 0) {
        const oldTotalRating = currentRating * currentTotalRatings;
        const newTotalRating = oldTotalRating - review.rating;
        newRating = newTotalRating / newTotalRatings;
      }

      // Update menu item
      await menuItemRef.update({
        rating: Math.round(newRating * 10) / 10,
        totalRatings: newTotalRatings,
        updatedAt: admin.firestore.Timestamp.now(),
      });

      console.log(
        `Updated rating for menu item ${menuItemId} after review deletion: ${newRating}`
      );

      // Update restaurant rating
      await updateRestaurantRating(review.restaurantId);

      return null;
    } catch (error) {
      console.error('Error updating menu item rating on delete:', error);
      return null;
    }
  });
