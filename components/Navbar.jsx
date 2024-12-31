import React from "react";
import "../public/styles/Navbar.css"; // Correct the path to the CSS file

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo">Quora</div>
      <input type="text" className="search-bar" placeholder="Search Quora" />
      <div className="actions">
        <i className="fas fa-bell"></i>
        <i className="fas fa-user-circle"></i>
        <button className="add-question">Add Question</button>
      </div>
    </div>
  );
};

export default Navbar;
