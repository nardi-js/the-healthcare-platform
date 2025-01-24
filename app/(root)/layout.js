"use client";

import { Navbar, Sidebar } from "@/components/layout";
import { useSidebar } from "@/context/SidebarContext";

export default function RootLayout({ children }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}
        >
          <div className="pt-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}