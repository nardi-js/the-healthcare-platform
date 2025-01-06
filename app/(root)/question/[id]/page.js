"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FaEye, FaTags, FaUser, FaClock, FaUserClock } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import VoteSystem from "@/components/VoteSystem";
import { useAuth } from "@/context/useAuth";
import { recordQuestionView } from "@/lib/utils/questionViews";
import QuestionComment from "@/components/QuestionComment";

const QuestionDetail = () => {
  const params = useParams();
  const { id } = params;
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [viewCount, setViewCount] = useState(0);

  const fetchQuestion = useCallback(async () => {
    try {
      const questionRef = doc(db, "questions", id);
      const questionDoc = await getDoc(questionRef);
      
      if (questionDoc.exists()) {
        const data = questionDoc.data();
        const questionData = {
          id: questionDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          lastViewed: data.lastViewed?.toDate?.() || data.lastViewed,
          author: {
            ...data.author,
            displayName: data.author?.displayName || "Anonymous"
          },
          tags: data.tags || [],
          answers: data.answers || [],
          views: data.views || 0,
          uniqueViewers: data.uniqueViewers || [],
          upvotes: data.upvotes || 0,
          downvotes: data.downvotes || 0,
          comments: data.comments || []
        };
        setQuestion(questionData);
        setViewCount(questionData.views);
        
        // Record the view
        await recordQuestionView(id, user?.uid);
        // Update local view count
        setViewCount(prev => prev + 1);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching question:", error);
      setLoading(false);
    }
  }, [id, user?.uid]);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id, fetchQuestion]);

  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = timestamp?.toDate?.() || new Date(timestamp);
    
    if (!(date instanceof Date) || isNaN(date)) {
      return null;
    }
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Question not found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The question you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <FaUser className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {question.author.displayName}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <FaClock className="w-3 h-3" />
                <span>{formatDate(question.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FaEye className="w-4 h-4" />
                <span>{viewCount}</span>
              </div>
              {question.uniqueViewers?.length > 0 && (
                <div className="text-xs">
                  {question.uniqueViewers.length} unique viewer{question.uniqueViewers.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            {question.lastViewed && (
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <FaUserClock className="w-4 h-4" />
                <span>Last viewed {formatDate(question.lastViewed)}</span>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {question.title}
        </h1>

        <div className="prose dark:prose-invert max-w-none mb-6">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {question.details}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
            >
              <FaTags className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {question.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {question.category}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <VoteSystem
            initialUpvotes={question.upvotes || 0}
            initialDownvotes={question.downvotes || 0}
            questionId={question.id}
          />
        </div>

        {/* Comments Section */}
        <QuestionComment 
          questionId={question.id}
          comments={question.comments || []}
          onCommentUpdate={fetchQuestion}
        />
      </motion.div>
    </div>
  );
};

export default QuestionDetail;
