import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PostList from '../components/PostList';
import TopBar from '../components/TopBar';
import ThemeToggle from '../components/ThemeToggle';

const posts = [
  { 
    title: "Post 1", 
    content: "This is the first post.", 
    author: "User 1", 
    authorImage: "/public/download.png", 
    postDate: "2023-10-01",
    upvotes: 10, 
    comments: 5, 
  },
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

  const handleAskClick = () => {
    console.log("Ask a Question clicked");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-[250px]">
        <TopBar />
        <Header onPostClick={handlePostClick} onAskClick={handleAskClick} />
        <main className="flex-1 p-6">
          <PostList posts={posts} /> {/* Pass posts to PostList */}
        </main>
        <div className="fixed bottom-4 right-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
