"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { FaThumbsUp, FaThumbsDown, FaComment, FaShare } from 'react-icons/fa';
import Image from 'next/image';

export default function PostDetail({ postId }) {
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const postDoc = await getDoc(doc(db, 'posts', postId));
        
        if (!postDoc.exists()) {
          setError('Post not found');
          return;
        }

        // Increment view count
        await updateDoc(doc(db, 'posts', postId), {
          views: increment(1)
        });

        setPost({
          id: postDoc.id,
          ...postDoc.data(),
          createdAt: postDoc.data().createdAt?.toDate() || new Date(),
        });

        // Fetch comments
        const commentsQuery = query(
          collection(db, 'posts', postId, 'comments'),
          orderBy('createdAt', 'desc')
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsList = commentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        setComments(commentsList);

      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleVote = async (type) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      const postRef = doc(db, 'posts', postId);
      if (type === 'up') {
        await updateDoc(postRef, {
          upvotes: increment(1)
        });
        setPost(prev => ({ ...prev, upvotes: (prev.upvotes || 0) + 1 }));
      } else {
        await updateDoc(postRef, {
          downvotes: increment(1)
        });
        setPost(prev => ({ ...prev, downvotes: (prev.downvotes || 0) + 1 }));
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (!comment.trim()) return;

    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const newComment = {
        content: comment,
        author: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || '/download.png'
        },
        createdAt: new Date(),
      };

      await addDoc(commentsRef, newComment);
      
      // Update post's comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1)
      });

      // Update local state
      setComments(prev => [{ id: Date.now(), ...newComment }, ...prev]);
      setComment('');
      
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          {/* Author Info */}
          <div className="flex items-center mb-4">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="ml-3">
              <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
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
          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleVote('up')}
                className="flex items-center space-x-1 text-gray-500 hover:text-purple-500"
              >
                <FaThumbsUp />
                <span>{post.upvotes || 0}</span>
              </button>
              <button
                onClick={() => handleVote('down')}
                className="flex items-center space-x-1 text-gray-500 hover:text-purple-500"
              >
                <FaThumbsDown />
                <span>{post.downvotes || 0}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-500">
                <FaComment />
                <span>{comments.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Comments</h2>
          
          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              rows="3"
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Post Comment
            </button>
          </form>

          {/* Comments List */}
          {showComments && (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b dark:border-gray-700 pb-4">
                  <div className="flex items-center mb-2">
                    <Image
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <div className="ml-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {comment.author.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-900 dark:text-white ml-10">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
          <button
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setShowComments(!showComments)}
          >
            <FaComment className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
