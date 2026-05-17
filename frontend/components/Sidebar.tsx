"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Appointments", href: "/appointments", icon: "📅" },
  { label: "Providers", href: "/providers", icon: "👨‍⚕️" },
  { label: "Medical Records", href: "/medical-records", icon: "📋" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden bg-blue-600 text-white p-2 rounded-lg"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-0"
        } bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 fixed h-screen left-0 top-0 shadow-lg overflow-hidden md:w-64 z-30`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <span className="text-3xl">🏥</span>
            <span>HealthCare</span>
          </h1>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-500 transition-all duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}