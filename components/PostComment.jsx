"use client";

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FaReply, FaTrash, FaEdit, FaHeart, FaRegHeart, FaEllipsisH } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { doc, collection, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth';
import Image from 'next/image';
import toast from 'react-hot-toast';

const Comment = ({ comment, level = 0, onReply, onDelete, onEdit, onLike, user, formatDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
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
    setEditText(comment.content);
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

  const handleDelete = () => {
    setShowActions(false);
    if (window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      onDelete(comment.id);
    }
  };

  const isLiked = comment.likes?.includes(user?.uid);
  const likeCount = comment.likes?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative ${level > 0 ? 'ml-4 md:ml-8 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}
    >
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        {/* Comment Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <Image
                src={comment.author.avatar || '/download.png'}
                alt={comment.author.name}
                width={32}
                height={32}
                className="rounded-full ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-700"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white hover:underline cursor-pointer">
                  {comment.author.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.editedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                    (edited)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaEllipsisH className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700"
                >
                  {user?.uid === comment.author.id && (
                    <>
                      <button
                        onClick={startEditing}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                  {!comment.replyTo && (
                    <button
                      onClick={() => {
                        setShowActions(false);
                        onReply(comment.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <FaReply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Comment Content */}
        <div className="mt-2">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={editInputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border rounded-lg resize-none bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
                rows="3"
                placeholder="Edit your comment..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>

        {/* Comment Actions */}
        {!isEditing && (
          <div className="mt-3 flex items-center space-x-4 text-sm">
            <button
              onClick={() => onLike(comment.id)}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'
              }`}
            >
              {isLiked ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
              <span>{likeCount > 0 ? likeCount : ''}</span>
            </button>
            {!comment.replyTo && (
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <FaReply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map(reply => (
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
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const PostComment = ({ postId, comments = [], onCommentUpdate }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const commentData = {
        content: newComment.trim(),
        author: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || '/download.png'
        },
        createdAt: serverTimestamp(),
        replyTo: replyTo,
        likes: []
      };

      const docRef = await addDoc(commentsRef, commentData);
      
      // Update post's comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: (comments?.length || 0) + 1
      });

      // Update local state with the new comment
      const commentWithId = {
        id: docRef.id,
        ...commentData,
        createdAt: new Date()
      };

      if (onCommentUpdate) {
        onCommentUpdate([commentWithId, ...comments]);
      }
      
      setNewComment('');
      setReplyTo(null);
      toast.success(replyTo ? "Reply posted!" : "Comment posted!");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete || commentToDelete.author.id !== user.uid) return;

    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      
      // Update post's comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: Math.max(0, (comments?.length || 0) - 1)
      });

      if (onCommentUpdate) {
        onCommentUpdate(comments.filter(c => c.id !== commentId));
      }
      toast.success("Comment deleted");
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment");
    }
  };

  const handleEditComment = async (commentId, newText) => {
    if (!user || !newText.trim()) return;

    const commentToEdit = comments.find(c => c.id === commentId);
    if (!commentToEdit || commentToEdit.author.id !== user.uid) return;

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      const updates = {
        content: newText.trim(),
        editedAt: serverTimestamp()
      };
      
      await updateDoc(commentRef, updates);

      if (onCommentUpdate) {
        const updatedComments = comments.map(c => 
          c.id === commentId 
            ? { ...c, ...updates, editedAt: new Date() }
            : c
        );
        onCommentUpdate(updatedComments);
      }
      toast.success("Comment updated");
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error("Failed to update comment");
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error("Please sign in to like comments");
      return;
    }

    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      const comment = comments.find(c => c.id === commentId);
      
      if (!comment) return;

      const likes = comment.likes || [];
      const userLiked = likes.includes(user.uid);
      
      const updates = {
        likes: userLiked
          ? likes.filter(uid => uid !== user.uid)
          : [...likes, user.uid]
      };

      await updateDoc(commentRef, updates);

      if (onCommentUpdate) {
        const updatedComments = comments.map(c =>
          c.id === commentId
            ? { ...c, ...updates }
            : c
        );
        onCommentUpdate(updatedComments);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error("Failed to update like");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Build comment tree
  const buildCommentTree = (comments) => {
    const commentMap = new Map();
    const rootComments = [];

    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.replyTo) {
        const parent = commentMap.get(comment.replyTo);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(comments);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex space-x-3">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {user?.displayName?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? "Write a reply..." : "What are your thoughts?"}
              className="w-full p-3 border rounded-lg resize-none bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
              rows="3"
            />
            {replyTo && (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                <span>Replying to comment</span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || !user || isSubmitting}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Posting...' : (replyTo ? 'Reply' : 'Comment')}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {commentTree.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={setReplyTo}
              onDelete={handleDeleteComment}
              onEdit={handleEditComment}
              onLike={handleLikeComment}
              user={user}
              formatDate={formatDate}
            />
          ))}
        </AnimatePresence>
        
        {commentTree.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComment;
