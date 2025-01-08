"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { FaEye, FaTags, FaUser, FaClock, FaUserClock, FaComment } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import VoteSystem from "@/components/VoteSystem";
import { useAuth } from "@/context/useAuth";
import { recordQuestionView } from "@/lib/utils/questionViews";
import QuestionComment from "@/components/QuestionComment";
import Image from 'next/image';

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
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching question:", error);
      setLoading(false);
    }
  }, [id]);

  // Record view in a separate useEffect to avoid double counting
  useEffect(() => {
    let hasRecordedView = false;

    const recordView = async () => {
      if (!hasRecordedView && user?.uid && id) {
        hasRecordedView = true;
        await recordQuestionView(id, user.uid);
        // Update local view count
        setViewCount(prev => prev + 1);
      }
    };

    recordView();
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
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative w-12 h-12">
            <Image
              src={question.author?.photoURL || "/download.png"}
              alt={question.author?.name || "Anonymous"}
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {question.author?.name || "Anonymous"}
              {question.author?.isTrusted && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Trusted
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(question.createdAt)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {question.title}
          </h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {question.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {question.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
            >
              {tag}
            </span>
          ))}
          {question.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {question.category}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <div className="flex items-center space-x-2">
            <FaEye className="w-5 h-5" />
            <span>{viewCount} views</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaComment className="w-5 h-5" />
            <span>{question.answers?.length || 0} answers</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaClock className="w-5 h-5" />
            <span>Asked {formatDate(question.createdAt)}</span>
          </div>
          {question.updatedAt && question.updatedAt !== question.createdAt && (
            <div className="flex items-center space-x-2">
              <FaUserClock className="w-5 h-5" />
              <span>Updated {formatDate(question.updatedAt)}</span>
            </div>
          )}
        </div>

        <VoteSystem
          itemId={id}
          itemType="questions"
          initialUpvotes={question.upvotes}
          initialDownvotes={question.downvotes}
        />

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
