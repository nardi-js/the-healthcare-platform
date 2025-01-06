"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import QuestionCard from "@/components/QuestionCard";
import { FaFilter, FaTimes, FaPlus, FaSearch } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useAuth';

const categories = ["All", "Medical", "Insurance", "Support", "General"];

const HomePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        let questionsQuery = query(collection(db, "questions"));

        if (selectedCategory !== "All") {
          questionsQuery = query(questionsQuery, where("category", "==", selectedCategory));
        }

        switch (sortBy) {
          case "latest":
            questionsQuery = query(questionsQuery, orderBy("createdAt", "desc"));
            break;
          case "views":
            questionsQuery = query(questionsQuery, orderBy("views", "desc"));
            break;
          case "votes":
            questionsQuery = query(questionsQuery, orderBy("upvotes", "desc"));
            break;
          default:
            questionsQuery = query(questionsQuery, orderBy("createdAt", "desc"));
        }

        questionsQuery = query(questionsQuery, limit(20));
        const querySnapshot = await getDocs(questionsQuery);
        
        let questionsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
        }));

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          questionsList = questionsList.filter(question => 
            question.title?.toLowerCase().includes(query) ||
            question.content?.toLowerCase().includes(query) ||
            question.category?.toLowerCase().includes(query)
          );
        }

        setQuestions(questionsList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedCategory, sortBy, searchQuery]);

  const handleNewQuestion = () => {
    router.push('/ask');
  };

  return (
    <div className="min-h-screen">
      {/* Search and Actions Bar */}
      <div className="sticky top-16 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                {isFilterMenuOpen ? <FaTimes /> : <FaFilter />}
                <span>Filters</span>
              </button>
              <button
                onClick={handleNewQuestion}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              >
                <FaPlus />
                <span>Ask Question</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Panel - Mobile */}
          <AnimatePresence>
            {isFilterMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            selectedCategory === category
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Sort By</h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2"
                    >
                      <option value="latest">Latest</option>
                      <option value="views">Most Viewed</option>
                      <option value="votes">Most Voted</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters Panel - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-32">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="flex flex-col space-y-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-2 rounded-lg text-sm text-left ${
                          selectedCategory === category
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2"
                  >
                    <option value="latest">Latest</option>
                    <option value="views">Most Viewed</option>
                    <option value="votes">Most Voted</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="flex-1">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                ))
              ) : questions.length > 0 ? (
                questions.map((question) => (
                  <QuestionCard 
                    key={question.id} 
                    question={question}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No questions found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {searchQuery 
                      ? "Try adjusting your search query or filters"
                      : "Be the first to ask a question!"}
                  </p>
                  <button
                    onClick={handleNewQuestion}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Ask a Question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
