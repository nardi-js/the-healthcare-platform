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
} from "react-icons/fa";

const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen } = useSidebar();
  const { user } = useAuth();

  const mainLinks = [
    { name: "Home", href: "/home", icon: FaHome },
    { name: "Dashboard", href: "/dashboard", icon: FaChartBar },
  ];

  const healthcareLinks = [
    { name: "Medical Records", href: "/medical-records", icon: FaNotesMedical },
    { name: "Appointments", href: "/appointments", icon: FaCalendarAlt },
    { name: "Find Doctors", href: "/doctors", icon: FaUserMd },
  ];

  const communityLinks = [
    { name: "Questions", href: "/questions", icon: FaQuestion },
    { name: "Discussions", href: "/discussions", icon: FaComments },
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

          {/* Healthcare */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Healthcare
            </h3>
            <div className="mt-3 space-y-1">{renderLinks(healthcareLinks)}</div>
          </div>

          {/* Community */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Community
            </h3>
            <div className="mt-3 space-y-1">{renderLinks(communityLinks)}</div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;