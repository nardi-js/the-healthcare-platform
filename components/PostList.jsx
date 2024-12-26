import React from 'react';
import Post from './Post';
import '../public/styles/PostList.css'; // Importing styles for PostList

const PostList = ({ posts }) => {
  return (
    <div className="post-list-container"> {/* Added a container for styling */}
      {posts.map((post, index) => (
        <Post key={index} title={post.title} content={post.content} />
      ))}
    </div>
  );
};

export default PostList;
