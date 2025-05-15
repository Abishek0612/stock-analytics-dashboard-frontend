"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  FiUser,
  FiLock,
  FiBell,
  FiSettings,
  FiAlertCircle,
  FiPieChart,
} from "react-icons/fi";

import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import ChartSettings from "@/components/settings/ChartSettings";

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState("profile");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  const tabCategories = [
    {
      id: "profile",
      name: "Profile",
      icon: FiUser,
      component: ProfileSettings,
    },
    {
      id: "security",
      name: "Security",
      icon: FiLock,
      component: SecuritySettings,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: FiBell,
      component: NotificationSettings,
    },
    {
      id: "appearance",
      name: "Appearance",
      icon: FiSettings,
      component: AppearanceSettings,
    },
    {
      id: "chart-preferences",
      name: "Chart Preferences",
      icon: FiPieChart,
      component: ChartSettings,
    },
  ];

  const CurrentTabComponent =
    tabCategories.find((tab) => tab.id === selectedTab)?.component ||
    ProfileSettings;

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-64 md:border-r md:border-gray-200 dark:md:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-1 p-2">
                {tabCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedTab(category.id)}
                      className={`w-full py-2.5 px-4 text-left rounded-lg focus:outline-none transition-colors ${
                        selectedTab === category.id
                          ? "bg-blue-500 text-white shadow"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        <span>{category.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:flex-1 p-6">
              <CurrentTabComponent setError={setError} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
