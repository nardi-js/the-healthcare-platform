"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaComment, 
  FaPaperPlane, 
  FaReply, 
  FaEdit, 
  FaTrash, 
  FaHeart, 
  FaFlag 
} from 'react-icons/fa';

const CommentSystem = ({ 
  postId, 
  userId, 
  initialComments = [],
  maxNestingLevel = 3 
}) => {
  // State Management
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());

  // Ref for comment input
  const commentInputRef = useRef(null);

  // Comment Submission Handler
  const handleSubmitComment = async (parentCommentId = null) => {
    // Validation
    if (!newComment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    // Prevent overly long comments
    if (newComment.length > 500) {
      alert('Comment exceeds maximum length of 500 characters');
      return;
    }

    try {
      // Prepare comment payload
      const commentPayload = {
        id: Date.now().toString(), // Temporary client-side ID
        content: newComment,
        author: {
          id: userId,
          name: 'Current User', // Replace with actual user name
          avatar: '/path/to/avatar.jpg'
        },
        parentCommentId,
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: []
      };

      // Optimistic UI Update
      if (parentCommentId) {
        setComments(prevComments => 
          updateNestedComments(prevComments, parentCommentId, commentPayload)
        );
      } else {
        setComments(prev => [commentPayload, ...prev]);
      }

      // Reset input and state
      setNewComment('');
      setReplyingToCommentId(null);

      // Actual API Call to Save Comment
      await saveComment(postId, commentPayload);
    } catch (error) {
      console.error('Comment submission failed', error);
      // Rollback UI changes
      handleCommentRollback(commentPayload);
    }
  };

  // Nested Comment Update Utility
  const updateNestedComments = (comments, parentId, newComment) => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newComment]
        };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateNestedComments(comment.replies, parentId, newComment)
        };
      }
      return comment;
    });
  };

  // Comment Editing Handler
  const handleEditComment = async (commentId, newContent) => {
    try {
      // Optimistic UI Update
      setComments(prevComments => 
        updateCommentContent(prevComments, commentId, newContent)
      );

      // Reset editing state
      setEditingCommentId(null);

      // API Call to Update Comment
      await updateComment(postId, commentId, newContent);
    } catch (error) {
      console.error('Comment edit failed', error);
      // Rollback changes
      handleCommentRollback();
    }
  };

  // Update Comment Content Utility
  const updateCommentContent = (comments, commentId, newContent) => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, content: newContent };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentContent(comment.replies, commentId, newContent)
        };
      }
      return comment;
    });
  };

  // Comment Deletion Handler
  const handleDeleteComment = async (commentId, parentCommentId = null) => {
    // Confirmation dialog
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      // Optimistic UI Update
      setComments(prevComments => 
        removeComment(prevComments, commentId, parentCommentId)
      );

      // API Call to Delete Comment
      await deleteComment(postId, commentId, parentCommentId);
    } catch (error) {
      console.error('Comment deletion failed', error);
      // Potentially restore the comment
    }
  };

  // Remove Comment Utility
  const removeComment = (comments, commentId, parentCommentId = null) => {
    if (parentCommentId) {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== commentId)
          };
        }
        return comment;
      });
    }
    return comments.filter(comment => comment.id !== commentId);
  };

  // Like Comment Handler
  const handleLikeComment = async (commentId) => {
    try {
      // Optimistic UI Update
      setComments(prevComments => 
        updateCommentLikes(prevComments, commentId)
      );

      // API Call to Like Comment
      await likeComment(postId, commentId);
    } catch (error) {
      console.error('Comment like failed', error);
    }
  };

  // Update Comment Likes Utility
  const updateCommentLikes = (comments, commentId) => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: (comment.likes || 0) + 1 };
      }
      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentLikes(comment.replies, commentId)
        };
      }
      return comment;
    });
  };

  // Render Individual Comment
  const renderComment = (comment, depth = 0) => {
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingToCommentId === comment.id;

    return (
      <div 
        key={comment.id} 
        className={`comment-container ${depth > 0 ? 'ml-4 border-l-2' : ''}`}
        style={{ 
          marginLeft: `${depth * 20}px`,
          opacity: depth >= maxNestingLevel ? 0.5 : 1
        }}
      >
        <div className="comment-header flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={comment.author.avatar} 
              alt={comment.author.name} 
              className="w-8 h-8 rounded-full mr-2" 
            />
            <span className="font-bold">{comment.author.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              {formatTimeAgo(comment.timestamp)}
            </span>
          </div>

          {/* Comment Actions */}
          <div className="comment-actions flex items-center space-x-2">
            {/* Like Button */}
            <button 
              onClick={() => handleLikeComment(comment.id)}
              className="flex items-center text-sm text-gray-600"
            >
              <FaHeart className="mr-1" />
              {comment.likes || 0}
            </button>

            {/* Reply Button */}
            {depth < maxNestingLevel && (
              <button 
                onClick={() => setReplyingToCommentId(comment .id)}
                className="flex items-center text-sm text-gray-600"
              >
                <FaReply className="mr-1" />
                Reply
              </button>
            )}

            {/* Edit Button */}
            <button 
              onClick={() => {
                setEditingCommentId(comment.id);
                setNewComment(comment.content);
              }}
              className="flex items-center text-sm text-gray-600"
            >
              <FaEdit className="mr-1" />
              Edit
            </button>

            {/* Delete Button */}
            <button 
              onClick={() => handleDeleteComment(comment.id)}
              className="flex items-center text-sm text-gray-600"
            >
              <FaTrash className="mr-1" />
              Delete
            </button>
          </div>
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="comment-edit">
            <textarea 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              className="border rounded p-2 w-full"
            />
            <button 
              onClick={() => handleEditComment(comment.id, newComment)} 
              className="bg-blue-500 text-white rounded px-2 py-1"
            >
              Save
            </button>
          </div>
        ) : (
          <p className="comment-content">{comment.content}</p>
        )}

        {/* Replies Section */}
        {isReplying && (
          <div className="reply-input">
            <textarea 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              className="border rounded p-2 w-full"
              placeholder="Write a reply..."
            />
            <button 
              onClick={() => handleSubmitComment(comment.id)} 
              className="bg-blue-500 text-white rounded px-2 py-1"
            >
              Submit
            </button>
          </div>
        )}

        {/* Render Replies Recursively */}
        {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
      </div>
    );
  };

  // Format Time Ago Utility
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  return (
    <div className="comment-system">
      <h3 className="text-lg font-bold mb-4">
        Comments ({comments.length})
      </h3>
      <div className="new-comment">
        <textarea 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)} 
          className="border rounded p-2 w-full"
          placeholder="Write a comment..."
        />
        <button 
          onClick={() => handleSubmitComment()} 
          className="bg-blue-500 text-white rounded px-2 py-1"
        >
          <FaPaperPlane className="mr-1" />
          Submit
        </button>
      </div>
      <div className="comments-list mt-4">
        {comments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
};

// API Interaction Functions (Placeholder - replace with actual implementation)
const saveComment = async (postId, commentPayload) => {
  // Implement actual comment saving logic
  console.log(`Saving comment for post ${postId}`, commentPayload);
};

const updateComment = async (postId, commentId, newContent) => {
  // Implement comment updating logic
  console.log(`Updating comment ${commentId} for post ${postId}`, newContent);
};

const deleteComment = async (postId, commentId, parentCommentId) => {
  // Implement comment deletion logic
  console.log(`Deleting comment ${commentId} for post ${postId}`);
};

const likeComment = async (postId, commentId) => {
  // Implement comment liking logic
  console.log(`Liking comment ${commentId} for post ${postId}`);
};

export default CommentSystem;