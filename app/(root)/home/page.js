"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { QuestionCard } from "@/components/features/Questions";
import { PostCard } from "@/components/features/Posts";
import { FaPlus } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [trendingQuestions, setTrendingQuestions] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingContent = async () => {
      try {
        setLoading(true);
        
        // Fetch trending questions
        const questionsQuery = query(
          collection(db, "questions"),
          orderBy("views", "desc"),
          limit(3)
        );
        const questionsSnapshot = await getDocs(questionsQuery);
        const questionsList = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
        }));
        setTrendingQuestions(questionsList);

        // Fetch trending posts
        const postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"), // First get recent posts
          limit(10) // Get more posts initially to filter
        );
        const postsSnapshot = await getDocs(postsQuery);
        const postsList = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
        }))
        // Sort by engagement (upvotes - downvotes)
        .sort((a, b) => {
          const aEngagement = (a.upvotes || 0) - (a.downvotes || 0);
          const bEngagement = (b.upvotes || 0) - (b.downvotes || 0);
          return bEngagement - aEngagement;
        })
        .slice(0, 3); // Take top 3 most engaged posts
        
        setTrendingPosts(postsList);

      } catch (error) {
        console.error("Error fetching trending content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingContent();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Description Section */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-6">
              Welcome to TheHealth
            </h1>
            <p className="text-lg leading-relaxed opacity-90">
              TheHealth is a web platform aligned with the United Nations' Sustainable Development Goal 3: Good Health and Well-being, designed to provide communities with reliable health information, promote preventive healthcare, and enhance community engagement. It allows users to share health-related posts, participate in discussions, and receive answers to health questions from peers or verified contributors. Addressing the limitations of existing health platforms, TheHealth fosters inclusivity with a user-friendly interface accessible to all ages and technical backgrounds. By creating an interactive environment, TheHealth aims to improve health awareness, enable meaningful connections, and empower underserved communities with impactful, easy-to-understand health education.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trending Questions Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Trending Questions
          </h2>
          {loading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {trendingQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          )}
        </section>

        {/* Trending Posts Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Trending Posts
          </h2>
          {loading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {trendingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
