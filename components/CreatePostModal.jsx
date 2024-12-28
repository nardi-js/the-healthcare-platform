"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  FaImage, 
  FaVideo, 
  FaPaperclip, 
  FaTags, 
  FaUserCircle,
  FaTimes,
  FaSave,
  FaTrash
} from 'react-icons/fa';


const CreatePostModal = ({ isOpen, onClose }) => {
  // State Management
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [postVisibility, setPostVisibility] = useState('public');
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // Refs for file inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Predefined Tags and Visibility Options
  const availableTags = [
    'Healthcare', 
    'Medical Research', 
    'Patient Care', 
    'Nutrition', 
    'Mental Health', 
    'Medical Technology'
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'healthcare', label: 'Healthcare Professionals' }
  ];

  // Reset Form Method
  const resetForm = () => {
    setPostContent('');
    setSelectedMedia([]);
    setSelectedTags([]);
    setMentionedUsers([]);
    setPostVisibility('public');
    setDraftSaved(false);
  };

  const handleMediaUpload = (event, type) => {
    if (!isClient) return; // Add this line to prevent execution on the server
  
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

    useEffect(() => {
      const createPreviews = () => {
        const mediaWithPreviews = selectedMedia.map(media => 
          media.preview ? media : {
            ...media,
            preview: media.type === 'image' 
              ? URL.createObjectURL(media.file) 
              : null
          }
        );
        
        setSelectedMedia(mediaWithPreviews);
      };
    
      if (isClient) {
        createPreviews();
      }
    
      // Cleanup function
      return () => {
        selectedMedia.forEach(media => {
          if (media.preview) {
            URL.revokeObjectURL(media.preview);
          }
        });
      };
    }, [selectedMedia, isClient]);
  
    setSelectedMedia(prevMedia => [
      ...prevMedia, 
      ...validFiles.map(file => ({ 
        file, 
        type, 
        preview: null // Initially set preview to null
      }))
    ]);
  };

  // Remove Media
  const removeMedia = (mediaToRemove) => {
    setSelectedMedia(prevMedia => 
      prevMedia.filter(media => media !== mediaToRemove)
    );
  };

  // Tag Management
  const handleTagToggle = (tag) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  // Save Draft
  const handleSaveDraft = () => {
    // In a real application, you would save to local storage or backend
    const draftPost = {
      content: postContent,
      media: selectedMedia,
      tags: selectedTags,
      visibility: postVisibility,
      timestamp: new Date().toISOString()
    };

    // Example: Save to localStorage
    localStorage.setItem('postDraft', JSON.stringify(draftPost));
    setDraftSaved(true);
    
    // Optional: Show a toast or notification
    alert('Draft saved successfully!');
  };

  // Load Draft
  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem('postDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setPostContent(draft.content);
      setSelectedTags(draft.tags);
      setPostVisibility(draft.visibility);
      
      // Note: Media might need special handling due to File objects
      alert('Draft loaded successfully!');
    }
  };

  // Cancel Confirmation
  const handleCancelClick = () => {
    // If there's content, show confirmation
    if (postContent.trim() || selectedMedia.length > 0) {
      setShowCancelConfirmation(true);
    } else {
      onClose();
    }
  };

  // Confirm Cancel
  const handleConfirmCancel = () => {
    resetForm();
    setShowCancelConfirmation(false);
    onClose();
  };

  // Cancel Confirmation Modal
  const CancelConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
      <div className="bg-white p-8 rounded-lg w-[400px] text-center">
        <h2 className="text-xl font-bold mb-4">Discard Post?</h2>
        <p className="mb-6">Are you sure you want to discard this post? All changes will be lost.</p>
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
          <input type='text' ></input>
        </div>
      </div>
    </div>
  );

  // Post Submission Handler
  const handleSubmitPost = async () => {
    // Validation
    const validationErrors = [];

    if (!postContent.trim()) {
      validationErrors.push("Post content cannot be empty");
    }

    if (postContent.length > 2000) {
      validationErrors.push("Post content exceeds maximum length of 2000 characters");
    }

    // Display Validation Errors
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }

    // Prepare Post Payload
    const postPayload = {
      content: postContent,
      media: selectedMedia.map(media => ({
        url: media.preview || URL.createObjectURL(media.file),
        type: media.type
      })),
      tags: selectedTags,
      visibility: postVisibility,
      timestamp: new Date().toISOString(),
      author: {
        id: 'current_user_id',
        name: 'Current User',
        avatar: '/path/to/user/avatar.jpg'
      }
    };

    try {
      // Simulated API Call
      console.log('Submitting Post:', postPayload);

      // Reset Form
      resetForm();

      // Close Modal
      onClose();

      // Success Notification
      alert('Post created successfully!');

    } catch (error) {
      console.error('Post Submission Error:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  // Render Method
  if (!isOpen) return null;
  // Prevent Rendering if Modal is Closed or Not on Client
if (!isClient || !isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto relative">
          {/* Close Button */}
          <button 
            onClick={handleCancelClick}
            className="absolute top-4  right-4 text-gray-600 hover:text-gray-800"
          >
            <FaTimes />
          </button>

          <h2 className="text-2xl font-bold mb-6">Create a New Post</h2>

          {/* Author Info */}
          <div className="flex items-center mb-4">
            <FaUser Circle className="text-4xl mr-4" />
            <div>
              <p className="font-bold">Current User</p>
            </div>
          </div>

          {/* Post Content Input */}
          <textarea 
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="Write your post here..."
            className="w-full h-40 p-2 border rounded mb-4"
            maxLength={2000}
          />
          <p className="text-sm text-gray-500 mb-4">
            {postContent.length}/2000 characters
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
              className="flex items-center bg-blue-100 p-2 rounded"
            >
              <FaImage className="mr-2" /> Images
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
              className="flex items-center bg-green-100 p-2 rounded"
            >
              <FaVideo className="mr-2" /> Videos
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
              className="flex items-center bg-yellow-100 p-2 rounded"
            >
              <FaPaperclip className="mr-2" /> Files
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

          {/* Tags Section */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">Tags</h3>
            {availableTags.map(tag => (
              <button 
                key={tag} 
                onClick={() => handleTagToggle(tag)} 
                className={`mr-2 mb-2 px-3 py-1 rounded ${selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Visibility Options */}
          <div className="mb-4">
            <h3 className="font-bold mb-2">Post Visibility</h3>
            {visibilityOptions.map(option => (
              <label key={option.value} className="flex items-center mb-2">
                <input 
                  type="radio" 
                  value={option.value} 
                  checked={postVisibility === option.value} 
                  onChange={() => setPostVisibility(option.value)} 
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>

          {/* Mentioned Users */}
          <div className="mb-4">
            <h3 className="font-bold mb- 2">Mention Users</h3>
            <input 
              type="text" 
              placeholder="Mention users (e.g., @username)" 
              className="w-full p-2 border rounded mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const user = e.target.value.trim();
                  if (user && !mentionedUsers.includes(user)) {
                    setMentionedUsers(prev => [...prev, user]);
                    e.target.value = '';
                  }
                }
              }}
            />
            <div className="flex flex-wrap">
              {mentionedUsers.map((user, index) => (
                <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full mr-2 mb-2">
                  {user} <button onClick={() => setMentionedUsers(prev => prev.filter(u => u !== user))} className="text-red-500 ml-1">x</button>
                </span>
              ))}
            </div>
          </div>

          {/* Save Draft Button */}
          <div className="flex justify-between mb-4">
            <button 
              onClick={handleSaveDraft} 
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Save Draft
            </button>
            <button 
              onClick={handleLoadDraft} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Load Draft
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSubmitPost} 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Submit Post
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmation && <CancelConfirmationModal />}
    </>
  );
};

export default CreatePostModal;