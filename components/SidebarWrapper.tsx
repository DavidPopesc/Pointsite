// components/SidebarWrapper.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/data/PointSiteLogo.png";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-gray-800 text-white p-4 space-y-4 relative`}>
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 rounded"
        >
          {isSidebarOpen ? "←" : "→"}
        </button>
        <div className="flex justify-center mb-6">
          <Image src={logo} alt="PointSite Logo" width={isSidebarOpen ? 80 : 40} height={isSidebarOpen ? 80 : 40} />
        </div>
        {isSidebarOpen && (
          <>
            <Link href="/dashboard" className="block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-center">Dashboard</Link>
            <Link href="/shop" className="block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-center">Shop</Link>
            <Link href="/send" className="block bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-center">Send Points</Link>
            <Link href="/credit" className="block bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 text-center">Credit Account</Link>
            <Link href="/login" className="block bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-center">Logout</Link>
          </>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
