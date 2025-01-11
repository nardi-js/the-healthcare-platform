"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, collection, query, orderBy, getDocs, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { FaClock, FaEye, FaTags, FaUser } from "react-icons/fa";
import VoteSystem from "@/components/VoteSystem";
import QuestionComment from "@/components/QuestionComment";

export default function QuestionDetailsPage() {
  const params = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);

  // Add real-time listener for the question document
  useEffect(() => {
    if (!params.id) return;

    const questionRef = doc(db, "questions", params.id);
    const unsubscribe = onSnapshot(questionRef, (doc) => {
      if (doc.exists()) {
        setQuestion({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        });
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  // Separate effect for fetching answers
  useEffect(() => {
    const fetchAnswers = async () => {
      if (!params.id) return;

      try {
        const answersQuery = query(
          collection(db, "questions", params.id, "answers"),
          orderBy("createdAt", "desc")
        );
        const answersSnapshot = await getDocs(answersQuery);
        const answersData = answersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        setAnswers(answersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching answers:", error);
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [params.id]);

  // Increment view count only once when the component mounts
  useEffect(() => {
    const incrementViewCount = async () => {
      if (!params.id) return;
      
      try {
        const questionRef = doc(db, "questions", params.id);
        await updateDoc(questionRef, {
          views: increment(1)
        });
      } catch (error) {
        console.error("Error incrementing view count:", error);
      }
    };

    incrementViewCount();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Question not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The question you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  } 

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Question Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <FaUser className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {question.author?.name || "Anonymous"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FaClock className="w-4 h-4" />
                <span>{formatDistanceToNow(question.createdAt)} ago</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 break-words">
            {question.title}
          </h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {question.content}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FaTags className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {Array.isArray(question.category) ? (
                  question.category.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {question.category}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaEye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {question.views || 0} views
              </span>
            </div>
          </div>

          {/* Vote System */}
          <VoteSystem postId={params.id} type="questions" />
        </div>

        {/* Question Content */}
        <div className="p-6">


          {/* Comments Section */}
          <div className="mt-8">
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
            >
              {showComments ? "Hide Comments" : `Show Comments (${question.comments?.length || 0})`}
            </button>
            {showComments && (
              <div className="mt-4">
                <QuestionComment
                  questionId={params.id}
                  comments={question.comments || []}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
        </h2>
        {answers.map((answer) => (
          <div
            key={answer.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <FaUser className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {answer.author?.name || "Anonymous"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(answer.createdAt)} ago
                </div>
              </div>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300">{answer.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
