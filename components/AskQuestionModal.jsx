"use client";

import React, { useState, useRef } from "react";
import { FaQuestion, FaTags, FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import fetchUserProfile from "@/lib/fetchUserProfile";

const AskQuestionModal = ({ isOpen, onClose }) => {
  // State Management
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDetails, setQuestionDetails] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Predefined Tags
  const availableTags = [
    "Healthcare",
    "Medical Research",
    "Patient Care",
    "Nutrition",
    "Mental Health",
    "Medical Technology",
  ];

  // File Upload Ref
  const fileInputRef = useRef(null);

  // Tag Selection Handler
  const handleTagToggle = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  // File Upload Handler
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => {
      // Validate file types and size
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return allowedTypes.includes(file.type) && file.size <= maxSize;
    });

    setAttachedFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  // Remove Attached File
  const removeFile = (fileToRemove) => {
    setAttachedFiles((prevFiles) =>
      prevFiles.filter((file) => file !== fileToRemove)
    );
  };

  const handleCancelClick = () => {
    if (questionDetails.trim() || attachedFiles.length > 0) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirmCancel = () => {
    resetForm();
    setShowCancelConfirmation(false);
    onClose();
  };

  const resetForm = () => {
    setQuestionTitle("");
    setQuestionDetails("");
    setSelectedTags([]);
    setAttachedFiles([]);
  };

  // Question Submission Handler
  const handleSubmitQuestion = async () => {
    // Comprehensive Validation
    const validationErrors = [];

    if (!questionTitle.trim()) {
      validationErrors.push("Question title is required");
    }

    if (questionTitle.length < 10) {
      validationErrors.push("Question title must be at least 10 characters");
    }

    if (selectedTags.length === 0) {
      validationErrors.push("Please select at least one tag");
    }

    // Display Validation Errors
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }

    try {
      // Fetch the user profile (returns the user's Firestore data)
      const user = await fetchUserProfile();

      if (!user) {
        throw new Error("User profile not found");
      }

      // Add the question to the questions collection
      await addDoc(collection(db, "questions"), {
        title: questionTitle,
        details: questionDetails,
        tags: selectedTags,
        attachments: attachedFiles.map((file) => file.name),
        timestamp: new Date().toISOString(),
        author: {
          id: user.uid, // User ID from the Firestore document
          name: user.name, // User name from the Firestore document
          avatar: user.photoURL, // User avatar from the Firestore document
        },
        status: "open",
        views: 0,
        answers: 0,
      });

      console.log("Question added successfully!");
    } catch (error) {
      console.error("Error adding question:", error.message);
    }
  };

  // Render Method
  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={handleCancelClick}
          className="absolute top-4 right-4 text-black hover:text-black"
        >
          <FaTimes className="text-black" />
        </button>
        <h2 className="text-2xl text-black font-bold mb-6 flex items-center">
          <FaQuestion className="mr-3 text-blue-500" /> Ask a Question
        </h2>

        {/* Question Title */}
        <div className="mb-4">
          <label className="block mb-2 text-black font-semibold">
            Question Title
          </label>
          <input
            type="text"
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            placeholder="What's your healthcare-related question?"
            className="w-full p-2 border rounded text-black"
            maxLength={200}
          />
          <p className="text-sm text-black mt-1">
            {questionTitle.length}/200 characters
          </p>
        </div>

        {/* Question Details */}
        <div className="mb-4">
          <label className="block mb-2 text-black font-semibold">
            Question Details
          </label>
          <textarea
            value={questionDetails}
            onChange={(e) => setQuestionDetails(e.target.value)}
            placeholder="Provide more context to your question..."
            className="w-full p-2 border text-black rounded h-32"
            maxLength={1000}
          />
          <p className="text-sm text-black mt-1">
            {questionDetails.length}/1000 characters
          </p>
        </div>

        {/* Tags Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-black items-center">
            <FaTags className="mr-2 text-green-500" /> Select Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`
                  px-3 py-1 rounded-full text-sm 
                  ${
                    selectedTags.includes(tag)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-black items-center">
            <FaCloudUploadAlt className="mr-2 text-purple-500" />
            Attach Files (Optional)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/jpeg,image/png,application/pdf"
            className="hidden "
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-gray-200 px-4 py-2 rounded text-black hover:bg-gray-300"
          >
            Upload Files
          </button>

          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mt-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded mb-1"
                >
                  <span>{file.name}</span>
                  <button
                    onClick={() => removeFile(file)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSubmitQuestion}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit Question
          </button>
        </div>
      </div>

      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
          <div className="bg-white p-8 rounded-lg w-[400px] text-center">
            <h2 className="text-xl font-bold mb-4">Discard Question?</h2>
            <p className="mb-6">
              Are you sure you want to discard this question? All changes will
              be lost.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCancelConfirmation(false)}
                className="bg-gray-200 text-black px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Keep Editing
              </button>
              <button
                onClick={handleConfirmCancel}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default AskQuestionModal;
