"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AskQuestionModal from "@/components/AskQuestionModal";
import QuestionCard from "@/components/QuestionCard";
import AnswerModal from "@/components/AnswerModal";
import { useAuth } from "@/context/useAuth";
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
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  limit,
} from "firebase/firestore";

const geist = Geist({ subsets: ["latin"] });

const categories = [
  "All",
  "General Medicine",
  "Mental Health",
  "Pediatrics",
  "Surgery",
  "Emergency Care",
  "Chronic Conditions",
  "Preventive Care",
];

const sortOptions = [
  { label: "Most Recent", value: "recent" },
  { label: "Most Answered", value: "answers" },
  { label: "Most Viewed", value: "views" },
  { label: "Unanswered", value: "unanswered" },
];

export default function QuestionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("questions");
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  const onAskClick = () => {
    setIsAskModalOpen(true);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        let questionsQuery = query(collection(db, "questions"));

        // Apply filters
        if (selectedCategory !== "All") {
          questionsQuery = query(questionsQuery, where("category", "==", selectedCategory));
        }

        // Apply sorting
        switch (sortBy) {
          case "answers":
            questionsQuery = query(questionsQuery, orderBy("answerCount", "desc"));
            break;
          case "views":
            questionsQuery = query(questionsQuery, orderBy("viewCount", "desc"));
            break;
          case "unanswered":
            questionsQuery = query(questionsQuery, where("answerCount", "==", 0));
            break;
          default:
            questionsQuery = query(questionsQuery, orderBy("createdAt", "desc"));
        }

        questionsQuery = query(questionsQuery, limit(20));
        const snapshot = await getDocs(questionsQuery);

        let fetchedQuestions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Apply search filter if query exists
        if (searchQuery) {
          fetchedQuestions = fetchedQuestions.filter((question) =>
            question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedCategory, sortBy, searchQuery]);

  const handleAnswer = (question) => {
    setCurrentQuestion(question);
    setIsAnswerModalOpen(true);
  };

  const handleAnswerSubmit = async (answerData) => {
    // Implementation for submitting answer
    setIsAnswerModalOpen(false);
    setActiveTab("answers");
  };

  const handleQuestionSubmitted = async (questionId) => {
    // Refresh questions list after new question is submitted
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        let questionsQuery = query(collection(db, "questions"));

        // Apply filters
        if (selectedCategory !== "All") {
          questionsQuery = query(questionsQuery, where("category", "==", selectedCategory));
        }

        // Apply sorting
        switch (sortBy) {
          case "answers":
            questionsQuery = query(questionsQuery, orderBy("answerCount", "desc"));
            break;
          case "views":
            questionsQuery = query(questionsQuery, orderBy("viewCount", "desc"));
            break;
          case "unanswered":
            questionsQuery = query(questionsQuery, where("answerCount", "==", 0));
            break;
          default:
            questionsQuery = query(questionsQuery, orderBy("createdAt", "desc"));
        }

        questionsQuery = query(questionsQuery, limit(20));
        const snapshot = await getDocs(questionsQuery);

        let fetchedQuestions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Apply search filter if query exists
        if (searchQuery) {
          fetchedQuestions = fetchedQuestions.filter((question) =>
            question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }

        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    await fetchQuestions();
  };

  return (
    <div className={`${geist.className} min-h-screen bg-gray-50 dark:bg-gray-900`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search questions..."
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
                    {categories.map((category) => (
                      <motion.button
                        key={category}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                          ${
                            selectedCategory === category
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
                              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center space-x-4">
                    <FaSort className="text-gray-400" />
                    <div className="flex gap-4">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`text-sm font-medium transition-colors
                            ${
                              sortBy === option.value
                                ? "text-purple-600 dark:text-purple-300"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onAskClick}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Ask a Question
          </button>
        </div>

        {/* Content Section */}
        <main className="space-y-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            (activeTab === "questions" ? questions : answers).length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {(activeTab === "questions" ? questions : answers).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {activeTab === "questions" ? (
                        <QuestionCard
                          question={item}
                          onAnswer={handleAnswer}
                        />
                      ) : (
                        <AnswerCard answer={item} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
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
                <AskQuestionModal />
              </div>
            )
          )}
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAskModalOpen && (
          <AskQuestionModal 
            isOpen={isAskModalOpen} 
            onClose={() => setIsAskModalOpen(false)}
            onQuestionSubmitted={handleQuestionSubmitted}
          />
        )}
      </AnimatePresence>
      <AnswerModal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        onSubmit={handleAnswerSubmit}
        question={currentQuestion}
      />
    </div>
  );
}
