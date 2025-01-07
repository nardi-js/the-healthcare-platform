"use client";

import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import ModalContent from "@/components/CreatePostModal";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
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
} from "react-icons/fa";

const geist = Geist({ subsets: ["latin"] });

const categories = [
  { id: "all", label: "All" },
  { id: "medical", label: "Medical" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "mental-health", label: "Mental Health" },
  { id: "nutrition", label: "Nutrition" },
  { id: "fitness", label: "Fitness" },
];

const sortOptions = [
  { id: "recent", label: "Most Recent" },
  { id: "answered", label: "Most Answered" },
  { id: "viewed", label: "Most Viewed" },
  { id: "unanswered", label: "Unanswered" },
];

export default function PostsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let postsQuery = query(collection(db, "posts"));

        // Apply category filter
        if (selectedCategory !== "all") {
          postsQuery = query(postsQuery, where("category", "==", selectedCategory));
        }

        // Apply sort order
        switch (selectedSort) {
          case "recent":
            postsQuery = query(postsQuery, orderBy("createdAt", "desc"));
            break;
          case "answered":
            postsQuery = query(postsQuery, orderBy("commentCount", "desc"));
            break;
          case "viewed":
            postsQuery = query(postsQuery, orderBy("views", "desc"));
            break;
          case "unanswered":
            postsQuery = query(postsQuery, where("commentCount", "==", 0));
            break;
          default:
            postsQuery = query(postsQuery, orderBy("createdAt", "desc"));
        }

        postsQuery = query(postsQuery, limit(20));
        const querySnapshot = await getDocs(postsQuery);

        let postsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt,
        }));

        // Apply search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          postsList = postsList.filter(post =>
            post.title?.toLowerCase().includes(query) ||
            post.content?.toLowerCase().includes(query) ||
            post.category?.toLowerCase().includes(query)
          );
        }

        setPosts(postsList);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, selectedSort, searchQuery]);

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className={`${geist.className} w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6`}>
      <div className="flex flex-col gap-6">
        {/* Search Bar and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FaFilter />
          </motion.button>
        </div>

        {/* Filters Dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${selectedCategory === category.id ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category.label}
                  </motion.button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <FaSort className="text-gray-400" />
                <div className="flex gap-4">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedSort(option.id)}
                      className={`text-sm font-medium transition-colors
                        ${selectedSort === option.id ? "text-purple-600 dark:text-purple-300" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Post Button */}
        <button
          onClick={handleCreatePost}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Create Post
        </button>

        {/* Posts Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <motion.div
                  key={i}
                  className="animate-pulse"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </motion.div>
              ))
            ) : posts.length > 0 ? (
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  No posts found
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {searchQuery
                    ? "Try adjusting your search query or filters"
                    : "Be the first to create a post!"}
                </p>
                <motion.button
                  onClick={handleCreatePost}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Post
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}