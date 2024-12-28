
"use client"; // Mark as a client component

import { useRouter } from 'next/navigation'; // Import useRouter
import Header from "@/components/Header";
import Post from "@/components/Post";
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
    content: 'This is an exciting post about healthcare!',
    media: [
      {
        type: 'image',
        url: '/path/to/image1.jpg'
      },
      {
        type: 'video',
        url: '/path/to/video.mp4'
      },
      {
        type: 'file',
        url: '/path/to/document.pdf',
        name: 'Medical Research Paper.pdf'
      }
    ],
    tags: ['healthcare', 'medical', 'research'],
    initialUpvotes: 10,
    initialDownvotes: 2,
    initialComments: [
      // Your comment structure
    ]
  }
,
  { 
    title: "Post 2", 
    content: "This is the second post.", 
    author: "User 2", 
    authorImage: "/images/image2.jpg", 
    postDate: "2023-10-02",
    upvotes: 3, 
    comments: 2, 
  },
];

export default function Home() {
  const handlePostClick = () => {
    console.log("Post clicked");
  };
  const router = useRouter(); // Initialize router


  const handleAskClick = () => {
    router.push('/questions');
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar /> {/* Render Sidebar */}
                <div className="flex-1 ml-64 p-4"> {/* Adjust margin for Sidebar */}
            <Header onPostClick={handlePostClick} onAskClick={handleAskClick} /> {/* Render Header */}
            <main className="content mt-6"> {/* Add margin-top for main content */}
              {posts.map((post, index) => (
                <Post
                  key={index}
                  title={post.title}
                  content={post.content}
                  author={post.author}
                  authorImage={post.authorImage}
                  postDate={post.postDate}
                  upvotes={post.upvotes} 
                  comments={post.comments} 
                />
              ))}
            </main>
          </div>
        </div>
      </body>
    </html>
 );
}
