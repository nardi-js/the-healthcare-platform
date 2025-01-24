"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, collection, query, orderBy, getDocs, onSnapshot, addDoc, serverTimestamp, setDoc } from "firebase/firestore";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { FaClock, FaEye, FaTags, FaUser } from "react-icons/fa";
import VoteSystem from "@/components/shared/VoteSystem";
import CommentSystem from "@/components/features/Comments/CommentSystem";
import Username from "@/components/shared/Username";
import { recordQuestionView } from "@/lib/utils/views";
import { toast } from 'react-toastify';
import { useAuth } from "@/context/useAuth";

export default function QuestionDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setLoading(false);
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
      } catch (error) {
        console.error("Error fetching answers:", error);
      }
    };

    fetchAnswers();
  }, [params.id]);

  // Add real-time listener for comments
  useEffect(() => {
    if (!params.id) return;

    const commentsRef = collection(db, "questions", params.id, "comments");
    const commentsQuery = query(commentsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [params.id]);

  // Increment view count only once when the component mounts
  useEffect(() => {
    if (!params.id) return;
    recordQuestionView(params.id, user?.uid);
  }, [params.id, user?.uid]);

  const handleAnswer = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to add an answer');
      return;
    }

    if (!answerContent.trim()) {
      toast.error('Answer cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const answerRef = await addDoc(collection(db, 'questions', params.id, 'answers'), {
        content: answerContent,
        authorId: user.uid,
        author: {
          name: user.displayName || 'Anonymous',
          image: user.photoURL || null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        votes: 0,
      });

      setAnswerContent('');
      toast.success('Answer posted successfully!');
      
      // Refresh answers
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
        } catch (error) {
          console.error("Error fetching answers:", error);
        }
      };

      fetchAnswers();
    } catch (error) {
      console.error('Error adding answer:', error);
      toast.error('Failed to post answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (type) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      // Vote logic here
      const voteRef = doc(db, 'questions', params.id, 'votes', user.uid);
      const voteDoc = await getDoc(voteRef);
      
      if (voteDoc.exists()) {
        toast.error('You have already voted on this question');
        return;
      }

      await setDoc(voteRef, {
        type,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      // Update question vote count
      await updateDoc(doc(db, 'questions', params.id), {
        [`${type}s`]: increment(1)
      });

      toast.success('Vote recorded successfully!');
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote. Please try again.');
    }
  };

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
              {question.author?.photoURL ? (
                <Image
                  src={question.author.photoURL}
                  alt={question.author.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <FaUser className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <div>
              <Username userId={question.author?.id} username={question.author?.name || "Anonymous"} />
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white">
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
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Comments</h2>
            <CommentSystem
              type="question"
              itemId={params.id}
              comments={comments}
              onCommentUpdate={() => {}} // No need for manual update since we have real-time listener
            />
          </div>
        </div>
      </div>
    </div>
  );
}
