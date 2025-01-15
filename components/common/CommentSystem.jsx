"use client";

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FaReply, FaTrash, FaEdit, FaHeart, FaRegHeart, FaEllipsisH, FaUserCircle } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { doc, collection, addDoc, deleteDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Username from '../Username';

const Comment = ({ comment, level = 0, onReply, onDelete, onEdit, onLike, user, formatDate, type }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || comment.text);
  const [showActions, setShowActions] = useState(false);
  const editInputRef = useRef(null);
  const actionsRef = useRef(null);

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

  const startEditing = () => {
    setIsEditing(true);
    setEditText(comment.content || comment.text);
    setShowActions(false);
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 100);
  };

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

  const commentContent = comment.content || comment.text;
  const hasLiked = comment.likes?.includes(user?.uid);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`pl-${level * 4} mb-4`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
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
          </div>
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
                    onClick={startEditing}
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

        {isEditing ? (
          <div className="mt-2">
            <textarea
              ref={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
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
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {commentContent}
          </p>
        )}

        <div className="mt-2 flex items-center space-x-4">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            {hasLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
            <span>{comment.likes?.length || 0}</span>
          </button>
          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <FaReply />
            <span>Reply</span>
          </button>
        </div>

        {comment.replies?.map((reply) => (
          <Comment
            key={reply.id}
            comment={reply}
            level={level + 1}
            onReply={onReply}
            onDelete={onDelete}
            onEdit={onEdit}
            onLike={onLike}
            user={user}
            formatDate={formatDate}
            type={type}
          />
        ))}
      </div>
    </motion.div>
  );
};

const CommentSystem = ({ type, itemId, comments = [], onCommentUpdate }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const commentData = {
        content: newComment.trim(),
        userId: user.uid,
        username: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || '',
        createdAt: replyTo ? new Date().toISOString() : serverTimestamp(),
        likes: [],
        replies: [],
      };

      const collectionPath = `${type}s/${itemId}/comments`;
      if (replyTo) {
        // Handle reply
        const parentComment = comments.find(c => c.id === replyTo);
        if (parentComment) {
          const parentRef = doc(db, collectionPath, replyTo);
          await updateDoc(parentRef, {
            replies: arrayUnion({
              ...commentData,
              id: Date.now().toString(), // Generate a client-side ID for replies
            }),
          });
        }
      } else {
        // Create new top-level comment
        await addDoc(collection(db, collectionPath), commentData);
      }

      setNewComment('');
      setReplyTo(null);
      toast.success('Comment added successfully');
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteDoc(doc(db, `${type}s/${itemId}/comments`, commentId));
      toast.success('Comment deleted successfully');
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleEdit = async (commentId, newText) => {
    try {
      await updateDoc(doc(db, `${type}s/${itemId}/comments`, commentId), {
        content: newText,
        updatedAt: serverTimestamp(),
      });
      toast.success('Comment updated successfully');
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      const commentRef = doc(db, `${type}s/${itemId}/comments`, commentId);
      const comment = comments.find(c => c.id === commentId);
      
      // If it's a reply comment, we need to find the parent comment and the reply
      const isReply = !comment;
      if (isReply) {
        // Find the parent comment that contains this reply
        const parentComment = comments.find(c => 
          c.replies?.some(reply => reply.id === commentId)
        );
        if (!parentComment) {
          console.error('Parent comment not found');
          return;
        }

        const reply = parentComment.replies.find(r => r.id === commentId);
        const updatedReplies = parentComment.replies.map(r => {
          if (r.id === commentId) {
            const likes = r.likes || [];
            const hasLiked = likes.includes(user.uid);
            return {
              ...r,
              likes: hasLiked 
                ? likes.filter(uid => uid !== user.uid)
                : [...likes, user.uid]
            };
          }
          return r;
        });

        await updateDoc(doc(db, `${type}s/${itemId}/comments`, parentComment.id), {
          replies: updatedReplies
        });
      } else {
        // Handle top-level comment likes
        const hasLiked = comment.likes?.includes(user.uid);
        await updateDoc(commentRef, {
          likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        });
      }

      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows="3"
        />
        <div className="mt-2 flex justify-between items-center">
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel Reply
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={(commentId) => setReplyTo(commentId)}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onLike={handleLike}
              user={user}
              formatDate={formatDate}
              type={type}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommentSystem;
