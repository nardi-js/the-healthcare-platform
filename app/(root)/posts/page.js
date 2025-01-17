"use client";

import { useState, useEffect } from "react";
import { PostCard, CreatePostModal } from "@/components/features/Posts";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Geist } from "next/font/google";
import {
  FaQuestion,
  FaCommentAlt,
  FaSearch,
  FaFilter,
  FaSort,
  FaTags,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaCalendar,
  FaStar,
  FaBookmark,
} from "react-icons/fa";
import { format } from 'date-fns';

const geist = Geist({ subsets: ["latin"] });

const categories = [
  { id: "Medical", label: "Medical" },
  { id: "Lifestyle", label: "Lifestyle" },
  { id: "Mental Health", label: "Mental Health" },
  { id: "Nutrition", label: "Nutrition" },
  { id: "Fitness", label: "Fitness" },
  { id: "Other", label: "Other" },
];

const sortOptions = [
  { id: "recent", label: "Most Recent" },
  { id: "answered", label: "Most Answered" },
  { id: "viewed", label: "Most Viewed" },
  { id: "liked", label: "Most Liked" },
  { id: "unanswered", label: "Unanswered" },
];

const dateRanges = [
  { id: "all", label: "All Time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

export default function PostsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSort, setSelectedSort] = useState("recent");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (isLoadMore = false) => {
    try {
      setLoading(true);
      let postsQuery = collection(db, "posts");

      // Only sort by createdAt
      postsQuery = query(postsQuery, orderBy("createdAt", "desc"), limit(20));

      // Add startAfter if loading more
      if (isLoadMore && lastVisible) {
        postsQuery = query(postsQuery, startAfter(lastVisible));
      }

      const querySnapshot = await getDocs(postsQuery);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 20);

      let fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        likes: doc.data().likes || 0,
        dislikes: doc.data().dislikes || 0
      }));

      // Apply category/tag filtering
      if (selectedCategories.length > 0) {
        fetchedPosts = fetchedPosts.filter(post => {
          if (!post.tags) return false;
          
          // Handle "Other" category
          if (selectedCategories.includes("Other")) {
            const hasCustomTag = post.tags.some(tag => 
              !categories.slice(0, -1).map(c => c.id).includes(tag)
            );
            if (hasCustomTag) return true;
          }
          
          // Check for selected predefined categories
          return post.tags.some(tag => selectedCategories.includes(tag));
        });
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
        
        fetchedPosts = fetchedPosts.filter(post => 
          post.createdAt >= cutoffDate
        );
      }

      // Apply sorting
      switch (selectedSort) {
        case "answered":
          fetchedPosts.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
          break;
        case "viewed":
          fetchedPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case "liked":
          fetchedPosts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        case "unanswered":
          fetchedPosts = fetchedPosts.filter(post => !post.commentCount || post.commentCount === 0);
          break;
      }

      // Search filter
      if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase().split(" ");
        fetchedPosts = fetchedPosts.filter(post =>
          searchTerms.every(term =>
            post.title?.toLowerCase().includes(term) ||
            post.content?.toLowerCase().includes(term) ||
            post.tags?.some(tag => tag.toLowerCase().includes(term))
          )
        );
      }

      if (isLoadMore) {
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        setPosts(fetchedPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategories, selectedSort, selectedDateRange, searchQuery]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(true);
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${geist.className}`}>
      {/* Header and Search */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Create Post
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300"
                : "bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            }`}
          >
            <FaFilter className="mr-2" />
            Filters
            {(selectedCategories.length > 0 || selectedDateRange !== "all") && (
              <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                {selectedCategories.length + (selectedDateRange !== "all" ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                    <FaTags className="mr-2" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center text-gray-700 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            }
                          }}
                          className="mr-2 accent-purple-600"
                        />
                        {category.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                    <FaSort className="mr-2" />
                    Sort By
                  </h3>
                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <label key={option.id} className="flex items-center text-gray-700 dark:text-gray-200">
                        <input
                          type="radio"
                          name="sort"
                          checked={selectedSort === option.id}
                          onChange={() => setSelectedSort(option.id)}
                          className="mr-2 accent-purple-600"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                    <FaCalendar className="mr-2" />
                    Time Period
                  </h3>
                  <div className="space-y-2">
                    {dateRanges.map((range) => (
                      <label key={range.id} className="flex items-center text-gray-700 dark:text-gray-200">
                        <input
                          type="radio"
                          name="dateRange"
                          checked={selectedDateRange === range.id}
                          onChange={() => setSelectedDateRange(range.id)}
                          className="mr-2 accent-purple-600"
                        />
                        {range.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedSort("recent");
                    setSelectedDateRange("all");
                    setSearchQuery("");
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center mt-8">
          <FaSpinner className="animate-spin text-3xl text-purple-600" />
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && posts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Load More
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <FaQuestion className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            No posts found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchPosts();
        }}
      />
    </div>
  );
}