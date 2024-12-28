"use client";

import React, { createContext, useState, useContext } from 'react';

// Create the context
const QuestionsContext = createContext();

// Provider component
export const QuestionsProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);

  // Function to add a new question
  const addQuestion = (newQuestion) => {
    setQuestions(prevQuestions => [newQuestion, ...prevQuestions]);
  };

  // Function to fetch questions (you'd typically do this from an API)
  const fetchQuestions = async () => {
    try {
      // Implement API call to fetch questions
      // const response = await api.getQuestions();
      // setQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch questions', error);
    }
  };

  return (
    <QuestionsContext.Provider value={{ 
      questions, 
      addQuestion, 
      fetchQuestions 
    }}>
      {children}
    </QuestionsContext.Provider>
  );
};

// Custom hook to use the questions context
export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (!context) {
    throw new Error('useQuestions must be used within a QuestionsProvider');
  }
  return context;
};