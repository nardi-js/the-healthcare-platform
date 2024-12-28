// CreatePostModal.jsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  FaImage, 
  FaVideo, 
  FaPaperclip, 
  FaTags, 
  FaUserCircle,
  FaTimes,
  FaTrash
} from 'react-icons/fa';

// Dynamically import component to ensure client-side rendering
const CreatePostModal = dynamic(() => import('./CreatePostModal'), { ssr: false });

const ModalContent = ({ isOpen, onClose }) => {
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const availableTags = [
    'Healthcare', 
    'Medical Research', 
    'Patient Care', 
    'Nutrition', 
    'Mental Health', 
    'Medical Technology'
  ];



  const resetForm = () => {
    setPostContent('');
    setSelectedMedia([]);
    setSelectedTags([]);
  };

  const handleMediaUpload = (event, type) => {
    if (typeof window === 'undefined') return;

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

    setSelectedMedia(prevMedia => [
      ...prevMedia,
      ...validFiles.map(file => ({
        file,
        type,
        preview: type === 'image' ? URL.createObjectURL(file) : null
      }))
    ]);
  };

  useEffect(() => {
    return () => {
      selectedMedia.forEach(media => {
        if (media.preview) {
          URL.revokeObjectURL(media.preview);
        }
      });
    };
  }, [selectedMedia]);

  const removeMedia = (mediaToRemove) => {
    setSelectedMedia(prevMedia => 
      prevMedia.filter(media => media !== mediaToRemove)
    );
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleCancelClick = () => {
    if (postContent.trim() || selectedMedia.length > 0) {
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

  const handleSubmitPost = async () => {
    const validationErrors = [];

    if (!postContent.trim()) {
      validationErrors.push("Post content cannot be empty");
    }

    if (postContent.length > 2000) {
      validationErrors.push("Post content exceeds maximum length of 2000 characters");
    }

    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      return;
    }

    const postPayload = {
      content: postContent,
      media: selectedMedia.map(media => ({
        url: media.preview || URL.createObjectURL(media.file),
        type: media.type
      })),
      tags: selectedTags,
      timestamp: new Date().toISOString(),
      author: {
        id: 'current_user_id',
        name: 'Current User',
        avatar: '/path/to/user/avatar.jpg'
      }
    };

    try {
      console.log('Submitting Post:', postPayload);
      resetForm();
      onClose();
      alert('Post created successfully!');
    } catch (error) {
      console.error('Post Submission Error:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={handleCancelClick}
          className="absolute top-4 right-4 text-black hover:text-black"
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-black">Create a New Post</h2>

        <textarea 
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          placeholder="Write your post here..."
          className="w-full h-40 p-2 border rounded mb-4 text-black"
          maxLength={2000}
        />
        <p className="text-sm text-black mb-4">
          {postContent.length}/2000 characters
        </p>

        <div className="flex space-x-4 mb-4">
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

        <div className="mb-4 ">
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

        <div className="mb-4">
          <h3 className="font-bold mb-2 text-black">Tags</h3>
          {availableTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => handleTagToggle(tag)} 
              className={`mr-2 mb-2 px-3 py-1 text-black rounded ${selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>

  

        <div className="flex justify-end">
          <button 
            onClick={handleSubmitPost} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit Post
          </button>
        </div>
      </div>

      {showCancelConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60">
          <div className="bg-white p-8 rounded-lg w-[400px] text-center">
            <h2 className="text-xl font-bold mb-4">Discard Post?</h2>
            <p className="mb-6">Are you sure you want to discard this post? All changes will be lost.</p>
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
  );
};

export default ModalContent;
