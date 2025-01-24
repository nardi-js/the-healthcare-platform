"use client";

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaReply, FaTrash, FaEdit, FaHeart, FaRegHeart, FaEllipsisH, FaUserCircle } from 'react-icons/fa';
import Image from 'next/image';
import { Username } from '@/components/shared';

/**
 * Comment component displays a single comment with user information, content, and interaction buttons
 * @param {Object} props
 * @param {Object} props.comment - Comment data object
 * @param {Function} props.onReply - Handler for reply action
 * @param {Function} props.onDelete - Handler for delete action
 * @param {Function} props.onEdit - Handler for edit action
 * @param {Function} props.onLike - Handler for like action
 * @param {Object} props.user - Current user object
 * @param {Function} props.formatDate - Date formatting function
 * @param {string} props.type - Type of the parent content
 * @param {Array} props.allComments - All comments for finding replies
 */
const Comment = ({ 
  comment, 
  onReply, 
  onDelete, 
  onEdit, 
  onLike, 
  user, 
  formatDate, 
  type, 
  allComments 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || comment.text);
  const [showActions, setShowActions] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const editInputRef = useRef(null);
  const actionsRef = useRef(null);
  const replyInputRef = useRef(null);

  // Find replies to this comment
  const replies = allComments.filter(c => c.replyTo?.commentId === comment.id);

  // Close actions menu when clicking outside
  const handleClickOutside = useCallback((event) => {
    if (actionsRef.current && !actionsRef.current.contains(event.target)) {
      setShowActions(false);
    }
  }, []);

  // Add/remove event listener for clicking outside
  useState(() => {
    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions, handleClickOutside]);

  const handleEdit = () => {
    onEdit(comment.id, editText);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleReplyKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReplySubmit();
    }
    if (e.key === 'Escape') {
      setShowReplyForm(false);
      setReplyText('');
    }
  };

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, comment.username, replyText);
    setShowReplyForm(false);
    setReplyText('');
  };

  const renderCommentWithMentions = (content) => {
    if (!content) return '';
    const mentionRegex = /@(\w+)/g;
    return content.replace(mentionRegex, '<span class="text-blue-500 dark:text-blue-400 font-medium">@$1</span>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mb-4 ${comment.replyTo ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}
    >
      {/* Comment content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        {/* User info and actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {comment.photoURL ? (
              <Image
                src={comment.photoURL}
                alt={comment.username}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <FaUserCircle className="w-8 h-8 text-gray-400" />
            )}
            <div className="flex flex-col">
              <Username userId={comment.userId} username={comment.username} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            {comment.replyTo && (
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                replying to <span className="text-blue-500 dark:text-blue-400">@{comment.replyTo.username}</span>
              </span>
            )}
          </div>
          {/* Edit/Delete actions */}
          {user?.uid === comment.userId && (
            <div className="relative" ref={actionsRef}>
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FaEllipsisH />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border dark:border-gray-700">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditText(comment.content || comment.text);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FaEdit className="mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(comment.id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment text */}
        {isEditing ? (
          <div className="mt-2">
            <textarea
              ref={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Edit your comment..."
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: renderCommentWithMentions(comment.content || comment.text) }}
          />
        )}

        {/* Like and Reply buttons */}
        <div className="mt-2 flex items-center space-x-4">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            {comment.likes?.includes(user?.uid) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            <span>{comment.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => {
              setShowReplyForm(!showReplyForm);
              if (!showReplyForm) {
                setTimeout(() => replyInputRef.current?.focus(), 100);
              }
            }}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <FaReply />
            <span>Reply{replies.length > 0 ? ` (${replies.length})` : ''}</span>
          </button>
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3 pl-8">
            <textarea
              ref={replyInputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleReplyKeyDown}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="2"
              placeholder={`Reply to @${comment.username}...`}
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText('');
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Reply
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map(reply => (
              <Comment
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onDelete={onDelete}
                onEdit={onEdit}
                onLike={onLike}
                user={user}
                formatDate={formatDate}
                type={type}
                allComments={allComments}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Comment;
