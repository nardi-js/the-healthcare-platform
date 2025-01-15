"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { FaThumbsUp, FaThumbsDown, FaComment, FaShare, FaEye, FaFlag, FaUser, FaClock, FaUserClock } from 'react-icons/fa';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import VoteSystem from '@/components/VoteSystem';
import CommentSystem from '@/components/common/CommentSystem';
import { recordPostView } from '@/lib/utils/postViews';
import Username from '@/components/Username'; // Import the Username component

export default function PostPage() {
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const postDoc = await getDoc(doc(db, 'posts', id));
      
      if (!postDoc.exists()) {
        setError('Post not found');
        return;
      }

      const postData = postDoc.data();
      const formattedPost = {
        id: postDoc.id,
        ...postData,
        createdAt: postData.createdAt?.toDate?.() || postData.createdAt,
        updatedAt: postData.updatedAt?.toDate?.() || postData.updatedAt,
        lastViewed: postData.lastViewed?.toDate?.() || postData.lastViewed,
        author: {
          ...postData.author,
          name: postData.author?.name || "Anonymous"
        },
        tags: postData.tags || [],
        upvotes: postData.upvotes || 0,
        downvotes: postData.downvotes || 0,
        views: postData.views || 0,
        uniqueViewers: postData.uniqueViewers || [],
        commentCount: postData.commentCount || 0
      };
      setPost(formattedPost);
      setViewCount(formattedPost.views);

      // Fetch comments
      const commentsQuery = query(
        collection(db, 'posts', id, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsList = commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      setComments(commentsList);

      // Record the view
      await recordPostView(id, user?.uid);
      // Update local view count
      setViewCount(prev => prev + 1);

    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  }, [id, user?.uid]);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id, fetchPost]);

  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = timestamp?.toDate?.() || new Date(timestamp);
    
    if (!(date instanceof Date) || isNaN(date)) {
      return null;
    }
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-pulse max-w-4xl w-full mx-auto p-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Post not found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The post you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
        >
          {/* Author Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Image
                src={post.author.avatar || '/download.png'}
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                {post && (
                  <div className="flex items-center space-x-4">
                    <Username userId={post.author?.id} username={post.author?.name} />
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <FaClock className="w-4 h-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <FaEye className="w-4 h-4" />
                  <span>{viewCount}</span>
                </div>
                {post.uniqueViewers?.length > 0 && (
                  <div className="text-xs">
                    {post.uniqueViewers.length} unique viewer{post.uniqueViewers.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              {post.lastViewed && (
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <FaUserClock className="w-4 h-4" />
                  <span>Last viewed {formatDate(post.lastViewed)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Media Content */}
          {post.media && post.media.length > 0 && (
            <div className="grid grid-cols-1 gap-4 mb-6">
              {post.media.map((item, index) => (
                <div key={index} className="relative">
                  {item.type === 'image' && (
                    <Image
                      src={item.url}
                      alt="Post media"
                      width={800}
                      height={600}
                      className="rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <VoteSystem
              initialUpvotes={post.upvotes}
              initialDownvotes={post.downvotes}
              postId={post.id}
            />
            <button
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setShowComments(!showComments)}
            >
              <FaComment className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Comments</h2>
            <CommentSystem
              type="post"
              itemId={id}
              comments={comments}
              onCommentUpdate={fetchPost}
            />
          </div>
        )}
      </div>
    </div>
  );
}
