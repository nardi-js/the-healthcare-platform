"use client";

import React, { createContext, useState, useContext } from "react";

const QuestionsContext = createContext();

export const QuestionsProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);

  const addQuestion = (newQuestion) => {
    setQuestions((prevQuestions) => [newQuestion, ...prevQuestions]);
  };

  const fetchQuestions = async () => {
    try {
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        addQuestion,
        fetchQuestions,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

// Custom hook to use the questions context
export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return context;
};
