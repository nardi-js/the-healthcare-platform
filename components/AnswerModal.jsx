"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaImage, FaVideo, FaPaperclip, FaUserCircle, FaTimes } from 'react-icons/fa';

const AnswerModal = ({ isOpen, onClose, questionId }) => {
  // Controlled Input State
  const [answerContent, setAnswerContent] = useState('');
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  
  
  // Media Upload State
  const [selectedMedia, setSelectedMedia] = useState([]);
  
  // Refs for file inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Hydration-Safe Media Upload Handler
  const handleMediaUpload = (event, type) => {
    // Validate and process file uploads
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif'],
        video: ['video/mp4', 'video/webm'],
        file: ['application/pdf', 'application/doc', 'application/docx']
      };
      const maxSize = 50 * 1024 * 1024; // 50MB
      return allowedTypes[type].includes(file.type) && file.size <= maxSize;
    });

    // Use functional update to ensure consistent state updates
    setSelectedMedia(prevMedia => [
      ...prevMedia, 
      ...validFiles.map(file => ({ 
        file, 
        type, 
        preview: type === 'image' ? URL.createObjectURL(file) : null 
      }))
    ]);
  };

  // Remove Media with Functional Update
  const removeMedia = (mediaToRemove) => {
    setSelectedMedia(prevMedia => 
      prevMedia.filter(media => media !== mediaToRemove)
    );
  };
  const handleCancelClick = () => {
    if (answerContent.trim() || selectedMedia.length > 0) {
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

  // Reset Form Method
  const resetForm = () => {
    setAnswerContent('');
    setSelectedMedia([]);
  };

  // Answer Submission Handler
  const handleSubmitAnswer = async () => {
    // Validation
    if (!answerContent.trim()) {
      alert("Answer content cannot be empty");
      return;
    }

    // Prepare Answer Payload
    const answerPayload = {
      content: answerContent,
      media: selectedMedia.map(media => ({
        url: media.preview || URL.createObjectURL(media.file),
        type: media.type
      })),
      questionId: questionId,
      timestamp: new Date().toISOString(),
      author: {
        id: 'current_user_id',
        name: 'Current User',
        avatar: '/path/to/user/avatar.jpg'
      }
    };

    try {
      // Simulated API Call
      console.log('Submitting Answer:', answerPayload);

      // Reset Form
      resetForm();

      // Close Modal
      onClose();

      // Success Notification
      alert('Answer submitted successfully!');

    } catch (error) {
      console.error('Answer Submission Error:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  // Hydration-Safe Effect for Resetting State
  useEffect(() => {
    // Reset form when modal closes
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Prevent Rendering if Modal is Closed
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={handleCancelClick}
          className="absolute top-4 right-4 text-black hover:text-black"
          >
          <FaTimes className='text-black'/>
        </button>
        <h2 className="text-2xl font-bold text-black mb-6">Submit Your Answer</h2>

        {/* Author Info */}
        <div className="flex items-center mb-4">
          <FaUserCircle className="text-4xl mr-4" />
          <div>
            <p className="font-bold text-black">Current User</p>
          </div>
        </div>

        {/* Answer Content Input */}
        <textarea 
          value={answerContent}
          onChange={(e) => setAnswerContent(e.target.value)}
          placeholder="Write your answer here..."
          className="w-full h-40 p-2 text-black border rounded mb-4"
          maxLength={2000}
        />
        <p className="text-sm text-black mb-4">
          {answerContent.length}/2000 characters
        </p>

        {/* Media Upload Section */}
        <div className="flex space-x-4 mb-4">
          {/* Image Upload */}
          <input 
            type="file" 
            ref={imageInputRef}
            onChange={(e) => handleMediaUpload(e, 'image')}
            multiple 
            accept="image/*"
            className="hidden"
          />
          <button 
            onClick={() => imageInputRef.current.click()}
            className="flex items-center text-black bg-blue-100 p-2 rounded"
          >
            <FaImage className="mr-2 text-black" /> Images
          </button>

          {/* Video Upload */}
          <input 
            type="file" 
            ref={videoInputRef}
            onChange={(e) => handleMediaUpload(e, 'video')}
            multiple 
            accept="video/*"
            className="hidden"
          />
          <button 
            onClick={() => videoInputRef.current.click()}
            className="flex items-center text-black bg-green-100 p-2 rounded"
          >
            <FaVideo className="mr-2 text-black" /> Videos
          </button>

          {/* File Upload */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => handleMediaUpload(e, 'file')}
            multiple 
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center text-black bg-yellow-100 p-2 rounded"
          >
            <FaPaperclip className="mr-2 text-black" /> Files
          </button>
        </div>

        {/* Selected Media Previews */}
        <div className="mb-4">
          {selectedMedia.map((media, index) => (
            <div key={index} className="flex items-center mb-2">
              {media.type === 'image' && (
                <img src={media.preview} alt="Preview" className="w-20 h-20 object-cover mr-2" />
              )}
              {media.type === 'video' && (
                <video src={media.preview} className="w-20 h-20 object-cover mr-2" controls />
              )}
              <span className="flex-1">{media.file.name}</span>
              <button 
                onClick={() => removeMedia(media)} 
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSubmitAnswer} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Answer
          </button>
        </div>
      </div>
      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
          <div className="bg-black p-8 rounded-lg w-[400px] text-center">
            <h2 className="text-xl font-bold mb-4">Discard Answer?</h2>
            <p className="mb-6">Are you sure you want to discard this answer? All changes will be lost.</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setShowCancelConfirmation(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
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
  );
};

export default AnswerModal;