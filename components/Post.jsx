"use client"; // Mark this component as a Client Component

import React, { useState } from 'react';
import '../public/styles/Post.css'; // Correct the path to the CSS file

const Post = ({ title, content, author, authorImage, postDate, userTitle, upvotes, comments, onFollowClick }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setCommentList([...commentList, { text: comment, author: "Current User", date: new Date().toLocaleString() }]);
      setComment(""); // Clear the comment input
    }
  };

  return (
    <div className="post">
      <div className="post-header">
        <img src={authorImage} alt={author} className="author-image" />
        <div className="author-info">
          <span className="author-name">{author}</span>
          {userTitle && <span className="user-title">{userTitle}</span>}
          <span className="post-date">{postDate}</span>
        </div>
      </div>
      {title && <h2 className="post-title">{title}</h2>}
      <p className="post-content">{content}</p>
      <div className="post-interactions">
        <button>Upvote {upvotes > 0 ? `(${upvotes})` : ''}</button>
        <button>Downvote</button>
        <button onClick={() => setShowComments(!showComments)}>Comments {comments > 0 ? `(${comments})` : ''}</button>
        <button>Share</button>
        <button onClick={onFollowClick}>Follow</button> {/* Follow button */}
      </div>
      {showComments && (
        <div className="comments-section">
          <h3>Comments</h3>
          {commentList.map((c, index) => (
            <div key={index} className="comment">
              <span className="comment-author">{c.author}</span>
              <p>{c.text}</p>
              <span className="comment-date">{c.date}</span>
            </div>
          ))}
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            placeholder="Add a comment..."
          />
          <button onClick={handleCommentSubmit}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default Post;