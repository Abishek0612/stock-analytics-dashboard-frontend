"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  FiHome,
  FiPieChart,
  FiSettings,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiMoon,
  FiSun,
} from "react-icons/fi";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [avatarKey, setAvatarKey] = useState(Date.now());
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e && e.key && e.key.startsWith("profilePhoto_")) {
        setAvatarKey(Date.now());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    setAvatarKey(Date.now());
  }, [user]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome },
    { name: "Profile", href: "/profile", icon: FiUser },
    { name: "Settings", href: "/settings", icon: FiSettings },
  ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getUserAvatar = () => {
    const localStoragePhoto = user?._id
      ? localStorage.getItem(`profilePhoto_${user._id}`)
      : null;

    if (localStoragePhoto) {
      return (
        <img
          src={localStoragePhoto}
          alt={user.name || "User"}
          className="h-9 w-9 rounded-full object-cover"
        />
      );
    } else if (user?.profilePhoto) {
      return (
        <img
          src={user.profilePhoto}
          alt={user.name || "User"}
          className="h-9 w-9 rounded-full object-cover"
        />
      );
    } else {
      return (
        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } transition-opacity ease-linear duration-300`}
      >
        <div
          className={`fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          } transition-opacity ease-linear duration-300`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition ease-in-out duration-300 transform`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              {mounted && <FiX className="h-6 w-6 text-white" />}
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                StockAnalytics
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      pathname === item.href
                        ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {mounted && (
                      <Icon
                        className={`mr-4 h-6 w-6 ${
                          pathname === item.href
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-gray-300 group-hover:text-gray-500 dark:group-hover:text-white"
                        }`}
                      />
                    )}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <button
              onClick={logout}
              className="flex-shrink-0 group block w-full flex items-center"
            >
              <div className="ml-3 w-full">
                <p className="text-base font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white flex items-center">
                  {mounted && (
                    <FiLogOut className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-300" />
                  )}
                  Log out
                </p>
              </div>
            </button>
          </div>
        </div>
        <div className="flex-shrink-0 w-14"></div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  StockAnalytics
                </h1>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white dark:bg-gray-800 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === item.href
                          ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {mounted && (
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            pathname === item.href
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-400 dark:text-gray-300 group-hover:text-gray-500 dark:group-hover:text-white"
                          }`}
                        />
                      )}
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={logout}
                className="flex-shrink-0 w-full group block"
              >
                <div className="flex items-center">
                  {/* Use key to force re-render when profile photo changes */}
                  <div key={avatarKey} className="flex-shrink-0">
                    {mounted && getUserAvatar()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white truncate max-w-[160px]">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                      Log out
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            {mounted && <FiMenu className="h-6 w-6" />}
          </button>
        </div>
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="fixed top-0 right-0 z-10 flex items-center p-4 space-x-2">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="bg-white dark:bg-gray-800 p-2 rounded-full text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {theme === "dark" ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
          <div className="py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
