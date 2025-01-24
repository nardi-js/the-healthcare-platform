"use client";

import { useState } from 'react';

/**
 * CommentForm component for creating new comments
 * @param {Object} props
 * @param {Function} props.onSubmit - Handler for form submission
 * @param {boolean} props.isSubmitting - Loading state for form submission
 * @param {string} props.placeholder - Placeholder text for the textarea
 * @param {string} props.initialValue - Initial value for the textarea
 * @param {string} props.buttonText - Text for the submit button
 */
const CommentForm = ({ 
  onSubmit, 
  isSubmitting = false, 
  placeholder = "Write a comment...",
  initialValue = "",
  buttonText = "Post Comment"
}) => {
  const [text, setText] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onSubmit(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows="3"
      />
      <div className="mt-2 flex justify-end space-x-2">
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Posting...' : buttonText}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
