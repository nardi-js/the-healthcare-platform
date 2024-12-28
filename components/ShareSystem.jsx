"use client";

import React, { useState } from 'react';
import {
  FaShare,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaTelegram,
  FaEnvelope
} from 'react-icons/fa';

const ShareSystem = ({ 
  url, 
  title, 
  description 
}) => {
  // State to manage share modal visibility
  const [showShareModal, setShowShareModal] = useState(false);

  // Sharing Methods
  const shareOptions = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: '#3b5998',
      shareLink: () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: '#1DA1F2',
      shareLink: () => {
        const text = encodeURIComponent(`${title}\n${description}`);
        const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: '#25D366',
      shareLink: () => {
        const text = encodeURIComponent(`${title}\n${description}\n${url}`);
        const shareUrl = `https://wa.me/?text=${text}`;
        window.open(shareUrl, '_blank');
      }
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: '#0088cc',
      shareLink: () => {
        const text = encodeURIComponent(`${title}\n${description}\n${url}`);
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`;
        window.open(shareUrl, '_blank');
      }
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: '#D44638',
      shareLink: () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${title}\n\n${description}\n\nRead more: ${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    }
  ];

  // Copy Link to Clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  // Share Modal Component
  const ShareModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Share</h2>
        
        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                option.shareLink();
                setShowShareModal(false);
              }}
              className="flex flex-col items-center p-2 rounded hover:bg-gray-100"
              style={{ color: option.color }}
            >
              <option.icon className="text-2xl mb-2" />
              <span className="text-xs">{option.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link Section */}
        <div className="flex items-center border rounded p-2">
          <input 
            type="text" 
            value={url} 
            readOnly 
            className="flex-grow bg-transparent outline-none text-sm truncate"
          />
          <button 
            onClick={copyLink}
            className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            Copy
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setShowShareModal(false)}
          className="mt-4 w-full bg-gray-200 py-2 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="share-system relative">
      {/* Share Button */}
      <button 
        onClick={() => setShowShareModal(true)}
        className="flex items-center text-gray-600 hover:text-blue-500"
      >
        <FaShare className="mr-2" /> Share
      </button>

      {/* Share Modal */}
      {showShareModal && <ShareModal />}
    </div>
  );
};

// Example Usage in a Page or Component
const SamplePage = () => {
  // Example content
  const shareContent = {
    url: 'https://example.com/your-post',
    title: 'Check out this amazing content!',
    description: 'This is a brief description of the content you want to share.'
  };

  return (
    <div>
      <h1>Your Page Content</h1>
      <ShareSystem 
        url={shareContent.url}
        title={shareContent.title}
        description={shareContent.description}
      />
    </div>
  );
};

export default ShareSystem;