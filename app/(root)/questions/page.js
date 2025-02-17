"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection } from "firebase/firestore";
import { QuestionCard, AskQuestionModal } from "@/components/features/Questions";
import { FaPlus, FaSearch, FaFilter, FaTags, FaSort, FaCalendar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Geist } from "next/font/google";
import { fetchFilteredItems } from "@/utils/filterUtils";

const categories = [
  { id: "General Medicine", label: "General Medicine" },
  { id: "Mental Health", label: "Mental Health" },
  { id: "Pediatrics", label: "Pediatrics" },
  { id: "Emergency care", label: "Emergency Care" },
  { id: "Chronic Condition", label: "Chronic Condition" },
  { id: "Preventive Care", label: "Preventive Care" },
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

const geist = Geist({ subsets: ["latin"] });

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSort, setSelectedSort] = useState("recent");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchQuestions = async (isLoadMore = false) => {
    try {
      setLoading(true);
      const result = await fetchFilteredItems({
        collectionName: 'questions',
        isLoadMore,
        lastVisible,
        selectedCategories,
        selectedSort,
        selectedDateRange,
        searchQuery,
        categories
      });

      if (isLoadMore) {
        setQuestions(prev => [...prev, ...result.items]);
      } else {
        setQuestions(result.items);
      }
      
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategories, selectedSort, selectedDateRange, searchQuery]);

  return (
    <main className={`${geist.className} container mx-auto px-4 py-8`}>
      {/* Header and Search */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Questions</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Ask Question
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                            setSelectedCategories(prev => {
                              const newCategories = e.target.checked
                                ? [...prev, category.id]
                                : prev.filter(id => id !== category.id);
                              return newCategories;
                            });
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

      {/* Questions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
        {questions.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No questions found
          </div>
        )}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => fetchQuestions(true)}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchQuestions();
        }}
      />
    </main>
  );
}
