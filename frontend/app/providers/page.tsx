"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface Provider {
  id: number;
  user_id: number;
  specialization: string;
  license_number: string;
  hospital_affiliation?: string;
  availability_hours?: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    fetchProviders();
  }, [router]);

  const fetchProviders = async (search = "") => {
    try {
      const url = search ? `/providers?specialization=${search}` : "/providers";
      const response = await api.get(url);
      setProviders(response.data);
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setLoading(true);
    fetchProviders(term);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Healthcare Providers</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by specialization (e.g., Cardiology, Neurology)..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No providers found</p>
              </div>
            ) : (
              providers.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white overflow-hidden shadow rounded-lg p-6"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Provider #{provider.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      License: {provider.license_number}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Specialization</p>
                      <p className="text-sm text-gray-600">
                        {provider.specialization || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Hospital</p>
                      <p className="text-sm text-gray-600">
                        {provider.hospital_affiliation || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/appointments")}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}