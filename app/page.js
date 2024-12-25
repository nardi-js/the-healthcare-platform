import Navbar from "@/components/Navbar";
import Feed from "@/components/Feed"; // Ensure you import the Feed component
import Image from "next/image";

const posts = [
  { 
    title: "Post 1", 
    content: "This is the first post.", 
    author: "User  1", 
    authorImage: "/downlad.png", // Replace with actual image path
    postDate: "2023-10-01" 
  },
  { 
    title: "Post 2", 
    content: "This is the second post.", 
    author: "User  2", 
    authorImage: "/path/to/image2.jpg", // Replace with actual image path
    postDate: "2023-10-02" 
  },
  // Add more posts as needed
];

export default function Home() {
  return (
    <div className="flex">
      <Navbar /> {/* Render Navbar on the left */}
      <div className="flex-1"> {/* This div will take the remaining space */}
        <Feed posts={posts} /> {/* Render Feed on the right */}
      </div>
    </div>
  );
}