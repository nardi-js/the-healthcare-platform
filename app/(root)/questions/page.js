"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import AskQuestionModal from "@/components/AskQuestionModal";
import QuestionCard from "@/components/QuestionCard";
import AnswerModal from "@/components/AnswerModal";
import { FaQuestion, FaCommentAlt } from "react-icons/fa";
import Image from "next/image";

import { db } from "@/lib/firebase";

export default function QuestionsPage() {
  // State Management
  const [activeTab, setActiveTab] = useState("questions");
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([
    {
      id: "q1",
      title:
        "How can we improve mental health awareness in healthcare settings?",
      description:
        "Researching strategies to enhance mental health support and reduce stigma within medical environments...",
      author: {
        name: "Dr. Emily Rodriguez",
        specialty: "Psychiatry",
        avatar: "/path/to/avatar1.jpg",
      },
      timestamp: new Date("2024-02-15T10:30:00Z"),
      tags: ["Mental Health", "Healthcare", "Patient Care"],
      answers: 0,
      upvotes: 35,
      status: "open",
    },
    // More sample questions...
  ]);

  const [answers, setAnswers] = useState([]);

  // Handle Answer Action
  const handleAnswer = (question) => {
    setCurrentQuestion(question);
    setIsAnswerModalOpen(true);
  };

  // Handle Answer Submission
  const handleAnswerSubmit = (answerData) => {
    // Create a new answer
    const newAnswer = {
      ...answerData,
      id: `a${answers.length + 1}`,
      timestamp: new Date(),
    };

    // Add answer to answers list
    setAnswers([...answers, newAnswer]);

    // Update the original question's answer count
    setQuestions(
      questions.map((q) =>
        q.id === currentQuestion.id
          ? { ...q, answers: q.answers + 1, status: "answered" }
          : q
      )
    );

    // Close the answer modal
    setIsAnswerModalOpen(false);

    // Switch to answers tab
    setActiveTab("answers");
  };

  // Render Answers Card
  const AnswerCard = ({ answer }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-xl transition-shadow duration-300">
      {/* Similar to previous AnswerCard implementation */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Image
            src={answer.author.avatar}
            alt={answer.author.name}
            className="w-12 h-12 rounded-full border-2 border-blue-100"
          />
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {answer.author.name}
            </h3>
            <p className="text-sm text-gray-500">{answer.author.specialty}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(answer.timestamp).toLocaleDateString()}
        </span>
      </div>

      <h4 className="text-xl font-semibold text-gray-900 mb-3">
        {answer.questionTitle}
      </h4>

      <p className="text-gray-600 mb-4 line-clamp-3">{answer.content}</p>
    </div>
  );

  return (
    <div className="container min-w-full mx-auto px-4 py-8">
      {/* Header with Ask Question Button */}
      <Header onAskClick={() => setIsAskModalOpen(true)} />

      {/* Tabs Section */}
      <div className="mb-8 flex items-center justify-center">
        <div className="flex bg-gray-100 rounded-full p-1 mt-4">
          <button
            onClick={() => setActiveTab("questions")}
            className={`
              flex items-center px-6 py-2 rounded-full transition-all duration-300
              ${
                activeTab === "questions"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            <FaQuestion className="mr-2" />
            Questions
            <span className="ml-2 bg-white text-blue-500 px-2 rounded-full text-sm">
              {questions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("answers")}
            className={`
              flex items-center px-6 py-2 rounded-full transition-all duration-300
              ${
                activeTab === "answers"
                  ? "bg-green-500 text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            <FaCommentAlt className="mr-2" />
            Answers
            <span className="ml-2 bg-white text-green-500 px-2 rounded-full text-sm">
              {answers.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="container min-w-full mx-auto px-4 py-8">
        {activeTab === "questions"
          ? questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onAnswer={handleAnswer}
              />
            ))
          : answers.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} />
            ))}
      </div>

      {/* Empty State Handling */}
      {(activeTab === "questions" && questions.length === 0) ||
        (activeTab === "answers" && answers.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600">
              {" "}
              {activeTab === "questions"
                ? "No questions available"
                : "No answers found"}
            </p>
          </div>
        ))}

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />

      {/* Answer Modal */}
      <AnswerModal
        isOpen={isAnswerModalOpen}
        onClose={() => setIsAnswerModalOpen(false)}
        onSubmit={handleAnswerSubmit}
        question={currentQuestion}
      />
    </div>
  );
}
