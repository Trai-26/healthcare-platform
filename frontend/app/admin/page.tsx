"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface Stats {
  total_users: number;
  total_appointments: number;
  total_patients: number;
  total_providers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_appointments: 0,
    total_patients: 0,
    total_providers: 0
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    api.get("/me")
      .then((response) => {
        setUser(response.data);
        if (response.data.role !== "admin") {
          router.push("/dashboard");
          return;
        }

        // Fetch stats
        return Promise.all([
          api.get("/appointments"),
          api.get("/patients"),
          api.get("/providers")
        ]);
      })
      .then((responses) => {
        const appointments = responses?.[0]?.data || [];
        const patients = responses?.[1]?.data || [];
        const providers = responses?.[2]?.data || [];

        setStats({
          total_users: (patients.length || 0) + (providers.length || 0),
          total_appointments: appointments.length || 0,
          total_patients: patients.length || 0,
          total_providers: providers.length || 0
        });
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">System Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon="👥"
              color="bg-blue"
            />
            <StatCard
              title="Total Patients"
              value={stats.total_patients}
              icon="🏥"
              color="bg-green"
            />
            <StatCard
              title="Total Providers"
              value={stats.total_providers}
              icon="👨‍⚕️"
              color="bg-purple"
            />
            <StatCard
              title="Total Appointments"
              value={stats.total_appointments}
              icon="📅"
              color="bg-yellow"
            />
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/appointments")}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-left"
                >
                  → View All Appointments
                </button>
                <button
                  onClick={() => router.push("/providers")}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-left"
                >
                  → View All Providers
                </button>
                <button
                  onClick={() => router.push("/medical-records")}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-left"
                >
                  → View Medical Records
                </button>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <HealthItem label="Backend API" status="healthy" />
                <HealthItem label="Database" status="healthy" />
                <HealthItem label="Frontend" status="healthy" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="text-3xl">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthItem({
  label,
  status
}: {
  label: string;
  status: "healthy" | "warning" | "error";
}) {
  const statusColors = {
    healthy: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800"
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusColors[status]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}