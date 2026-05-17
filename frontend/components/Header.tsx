"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.get("/me").then((res) => setUser(res.data));
    }
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-20 md:ml-64">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium text-gray-800">{user.full_name}</p>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.full_name?.[0] || "U"}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}