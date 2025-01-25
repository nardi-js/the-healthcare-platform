"use client";

import { collection, query, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Fetch and filter items (posts or questions) from Firestore
 * @param {Object} params - Parameters for fetching and filtering
 * @param {string} params.collectionName - Name of the Firestore collection ('posts' or 'questions')
 * @param {boolean} params.isLoadMore - Whether this is a load more operation
 * @param {Object} params.lastVisible - Last document for pagination
 * @param {Array} params.selectedCategories - Selected category filters
 * @param {string} params.selectedSort - Sort option ('recent', 'answered', etc.)
 * @param {string} params.selectedDateRange - Date range filter
 * @param {string} params.searchQuery - Search query string
 * @param {Array} params.categories - Available categories for filtering
 * @returns {Object} Filtered items and pagination info
 */
export const fetchFilteredItems = async ({
  collectionName,
  isLoadMore = false,
  lastVisible,
  selectedCategories,
  selectedSort,
  selectedDateRange,
  searchQuery,
  categories,
}) => {
  try {
    let itemsQuery = collection(db, collectionName);

    // Base query with sorting and limit
    itemsQuery = query(itemsQuery, orderBy("createdAt", "desc"), limit(20));

    // Add startAfter if loading more
    if (isLoadMore && lastVisible) {
      itemsQuery = query(itemsQuery, startAfter(lastVisible));
    }

    const querySnapshot = await getDocs(itemsQuery);
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    const hasMore = querySnapshot.docs.length === 20;

    let fetchedItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      likes: doc.data().likes || 0,
      dislikes: doc.data().dislikes || 0
    }));

    // Apply category filtering
    if (selectedCategories.length > 0) {
      if (collectionName === 'posts') {
        // Posts use tags array
        fetchedItems = fetchedItems.filter(item => {
          if (!item.tags) return false;
          
          // Handle "Other" category
          if (selectedCategories.includes("Other")) {
            const hasCustomTag = item.tags.some(tag => 
              !categories.slice(0, -1).map(c => c.id).includes(tag)
            );
            if (hasCustomTag) return true;
          }
          
          return item.tags.some(tag => selectedCategories.includes(tag));
        });
      } else {
        // Questions use single category
        fetchedItems = fetchedItems.filter(item =>
          selectedCategories.includes(item.category)
        );
      }
    }

    // Date range filter
    if (selectedDateRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (selectedDateRange) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      fetchedItems = fetchedItems.filter(item => 
        item.createdAt >= cutoffDate
      );
    }

    // Apply sorting
    switch (selectedSort) {
      case "answered":
        fetchedItems.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
        break;
      case "viewed":
        fetchedItems.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "liked":
        fetchedItems.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case "unanswered":
        fetchedItems = fetchedItems.filter(item => !item.commentCount || item.commentCount === 0);
        break;
    }

    // Search filter
    if (searchQuery) {
      const searchTerms = searchQuery.toLowerCase().split(" ");
      fetchedItems = fetchedItems.filter(item =>
        searchTerms.every(term =>
          item.title?.toLowerCase().includes(term) ||
          item.content?.toLowerCase().includes(term) ||
          (item.category?.toLowerCase().includes(term) || 
           item.tags?.some(tag => tag.toLowerCase().includes(term)))
        )
      );
    }

    return {
      items: fetchedItems,
      lastVisible: newLastVisible,
      hasMore
    };
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};
