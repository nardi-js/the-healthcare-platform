"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FaUser, FaReply, FaTrash, FaEdit } from 'react-icons/fa';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/useAuth';

const Comment = ({ comment, level = 0, onReply, onDelete, onEdit, user, formatDate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const editInputRef = useRef(null);

  const startEditing = () => {
    setIsEditing(true);
    setEditText(comment.text);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${
        level > 0 ? 'ml-8 border-l-4 border-gray-300 dark:border-gray-600' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          {comment.author.photoURL ? (
            <img
              src={comment.author.photoURL}
              alt={comment.author.displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <FaUser className="w-8 h-8 text-gray-400" />
          )}
          <div>
            <div className="font-medium dark:text-white">
              {comment.author.displayName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
              {comment.editedAt && ' (edited)'}
            </div>
          </div>
        </div>
        
        {user?.uid === comment.author.uid && (
          <div className="flex space-x-2">
            <button
              onClick={startEditing}
              className="text-gray-500 hover:text-blue-500 dark:text-gray-400"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => onDelete(comment.id)}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={editInputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              rows="3"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={!editText.trim()}
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-gray-200">{comment.text}</p>
        )}
      </div>

      {!isEditing && (
        <button
          onClick={() => onReply(comment.id)}
          className="mt-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center space-x-1"
        >
          <FaReply />
          <span>Reply</span>
        </button>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              user={user}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const QuestionComment = ({ questionId, comments = [], onCommentUpdate }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const { user } = useAuth();

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Helper function to build comment tree
  const buildCommentTree = (comments) => {
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build the tree
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

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    const commentData = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL
      },
      createdAt: new Date().toISOString(),
      replyTo: replyTo,
      replies: []
    };

    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        comments: arrayUnion(commentData)
      });
      await updateDoc(questionRef, {
        lastCommentAt: serverTimestamp()
      });
      
      setNewComment('');
      setReplyTo(null);
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    try {
      const questionRef = doc(db, 'questions', questionId);
      
      // Find the comment and all its replies recursively
      const findCommentAndReplies = (commentId, comments) => {
        const commentsToDelete = [];
        const remainingComments = [];
        
        comments.forEach(comment => {
          if (comment.id === commentId || comment.replyTo === commentId) {
            commentsToDelete.push(comment);
            // Recursively find replies to this comment
            const replies = comments.filter(c => c.replyTo === comment.id);
            commentsToDelete.push(...findCommentAndReplies(comment.id, replies)[0]);
          } else {
            remainingComments.push(comment);
          }
        });
        
        return [commentsToDelete, remainingComments];
      };

      const [commentsToDelete, remainingComments] = findCommentAndReplies(commentId, comments);

      // Update the comments array
      await updateDoc(questionRef, {
        comments: remainingComments
      });

      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (commentId, newText) => {
    if (!user || !newText.trim()) return;

    try {
      const questionRef = doc(db, 'questions', questionId);
      const updatedComments = comments.map(comment => 
        comment.id === commentId
          ? {
              ...comment,
              text: newText.trim(),
              editedAt: new Date().toISOString()
            }
          : comment
      );
      
      await updateDoc(questionRef, { 
        comments: updatedComments,
        lastEditAt: serverTimestamp()
      });

      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const commentTree = buildCommentTree(comments);

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          rows="3"
        />
        <div className="flex justify-end space-x-2">
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel Reply
            </button>
          )}
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {replyTo ? 'Post Reply' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments Tree */}
      <div className="space-y-4">
        {commentTree.map(comment => (
          <Comment
            key={comment.id}
            comment={comment}
            onReply={setReplyTo}
            onDelete={handleDeleteComment}
            onEdit={handleEditComment}
            user={user}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionComment;
