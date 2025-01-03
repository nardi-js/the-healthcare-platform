"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import VoteSystem from "./VoteSystem";
import CommentSystem from "./CommentSystem";
import { FaComment, FaTags, FaReply } from "react-icons/fa";

const QuestionContainer = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(
          collection(db, "questions"),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const questionData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuestions(questionData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onAnswer={(q) => console.log("Answer clicked", q)}
        />
      ))}
    </div>
  );
};

const QuestionCard = ({ question, onAnswer }) => {
  return (
    <div className="container border border-gray-300 rounded-lg p-4 my-4 w-full dark:bg-slate-800 bg-white shadow-md dark:border-slate-700">
      {/* Question Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <img
            src={question.author?.avatar || "/default-avatar.png"}
            alt={question.author?.name || "Anonymous"}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">
              {question.author?.name || "Anonymous"}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(question.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Question Stats */}
        <div className="flex items-center space-x-4 text-gray-600">
          <div className="flex items-center">
            <FaComment className="mr-2" />
            <span>{question.answers || 0}</span>
          </div>
        </div>
      </div>

      {/* Question Title and Details */}
      <h2 className="text-xl font-bold mb-2">{question.title}</h2>
      <p className="text-gray-700 mb-4">{question.details}</p>

      {/* Tags */}
      <div className="flex items-center mb-4">
        <FaTags className="mr-2 text-gray-500" />
        <div className="flex flex-wrap gap-2">
          {question.tags?.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Interaction Systems */}
      <div className="post-interactions flex justify-between items-center border-t pt-4">
        <div className="flex items-center space-x-4 max-w-24">
          <VoteSystem
            postId={question.id}
            initialUpvotes={question.upvotes || 0}
            initialDownvotes={question.downvotes || 0}
          />
          <button
            onClick={() => onAnswer(question)}
            className="flex items-center text-white px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            <FaReply className="mr-2" />
            Answer
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-4">
        <CommentSystem
          postId={question.id}
          initialComments={question.comments || []}
        />
      </div>
    </div>
  );
};

export default QuestionContainer;
