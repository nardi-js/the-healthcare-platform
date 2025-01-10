"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/useAuth";
import {
  FaHome,
  FaChartBar,
  FaNotesMedical,
  FaCalendarAlt,
  FaUserMd,
  FaQuestion,
  FaComments,
  FaUserShield,
  FaInfoCircle,
} from "react-icons/fa";

const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen } = useSidebar();
  const { user } = useAuth();

  const mainLinks = [
    { name: "Home", href: "/home", icon: FaHome },
    { name: "About Us", href: "/about-us", icon: FaInfoCircle },
  ];

  const communityLinks = [
    { name: "Questions", href: "/questions", icon: FaQuestion },
    { name: "Posts", href: "/posts", icon: FaComments },
  ];

  const trustedUserLinks = [
    { name: "Become Trusted User", href: "/trusted-application", icon: FaUserShield },
  ];

  const renderLinks = (links) => {
    return links.map((link) => {
      const isActive = pathname === link.href;
      const Icon = link.icon;

      return (
        <Link
          key={link.name}
          href={link.href}
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isActive
              ? "bg-purple-600 text-white"
              : "text-gray-300 hover:bg-gray-800"
          }`}
        >
          <Icon className="w-5 h-5 mr-3" />
          <span>{link.name}</span>
        </Link>
      );
    });
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-gray-900 transition-all duration-300 ease-in-out z-20 ${
        isSidebarOpen ? "w-64" : "w-0 -translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full pt-16 overflow-y-auto">
        {/* User Profile */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                {user.displayName?.[0] || user.email?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.displayName || user.email}
                </p>
                {user.isTrusted && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Trusted User
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-6">
          {/* Main */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </h3>
            <div className="mt-3 space-y-1">{renderLinks(mainLinks)}</div>
          </div>

          {/* Community */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Community
            </h3>
            <div className="mt-3 space-y-1">{renderLinks(communityLinks)}</div>
          </div>

          {/* Trusted User Section */}
          {user && !user.isTrusted && (
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Verification
              </h3>
              <div className="mt-3 space-y-1">{renderLinks(trustedUserLinks)}</div>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;