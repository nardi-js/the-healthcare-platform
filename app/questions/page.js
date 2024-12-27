"use client";

import React, { useEffect } from 'react';
import { useQuestions } from '@/context/QuestionsContext';

export default function QuestionsPage() {
  const { questions, fetchQuestions } = useQuestions();

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Recent Questions</h1>
      {questions.length === 0 ? (
        <p>No questions available</p>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div 
              key={question.id} 
              className="border p-4 rounded-lg shadow-sm"
            >
              <h2 className="text-xl font-semibold">{question.title}</h2>
              <p className="text-gray-600">{question.details}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <span className="mr-2">Tags:</span>
                  {question.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  Asked by {question.author.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}