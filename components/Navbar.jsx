import React from 'react'
import ThemeToggle from './ThemeToggle'; 
const Navbar = () => {
  return (
    <div className="w-1/5 bg-black h-screen p-4">
    <div className="text-red-600 text-3xl font-bold mb-4">TheHealth</div>
    <ul className="space-y-4">
        <li className="flex items-center text-white">
            <i className="fas fa-home mr-2"></i> Home
        </li>
        <li className="flex items-center text-white">
            <i className="fas fa-pen mr-2"></i> profile
        </li>
        <li className="flex items-center text-white">
            <i className="fas fa-book mr-2"></i> Writing
       </li>
    </ul>
    <div className="mt-4">
        <ThemeToggle /> {/* Add the ThemeToggle button */}
      </div>
</div>
  );
}

export default Navbar