"use client"; // Mark as a client component

import Header from "@/components/Header";
import Post from "@/components/Post";
//import Navbar from "@/components/Navbar"; // Import Navbar
import Sidebar from "@/components/Sidebar";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const posts = [
  {
    id: 'post123',
    author: {
      name: 'John Doe',
      avatar: '/path/to/avatar.jpg'
    },
    timestamp: new Date().toISOString(),
    content: 'This is a sample post content.',
    media: [],
    tags: [],
    initialUpvotes: 0,
    initialDownvotes: 0,
    initialComments: [],
  },
  // Add more posts here
];

<<<<<<< Updated upstream
export default function Home() {
  const handlePostClick = () => {
    console.log("Post clicked");
  };

  const handleAskClick = () => {
    console.log("Ask a Question clicked");
  };

=======
const HomePage = () => {
>>>>>>> Stashed changes
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4">
          {posts.map(post => (
            <Post
              key={post.id}
              id={post.id}
              author={post.author}
              timestamp={post.timestamp}
              content={post.content}
              media={post.media}
              tags={post.tags}
              initialUpvotes={post.initialUpvotes}
              initialDownvotes={post.initialDownvotes}
              initialComments={post.initialComments}
            />
          ))}
        </main>
      </div>
    </div>
  );
};

export default HomePage;