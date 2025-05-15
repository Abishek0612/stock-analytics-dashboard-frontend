"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useAuth } from "@/lib/auth/AuthProvider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StockSearchSelect from "@/components/ui/StockSearchSelect";
import { API_URL } from "@/lib/config";
import {
  FiSave,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

const saveConfigSchema = z.object({
  name: z.string().min(1, "Configuration name is required"),
  timeframe: z.string().min(1, "Timeframe is required"),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const [favoriteStocks, setFavoriteStocks] = useState([]);
  const [dashboardConfigs, setDashboardConfigs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveConfigMode, setSaveConfigMode] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const popularStockOptions = [
    { value: "AAPL", label: "AAPL - Apple Inc." },
    { value: "MSFT", label: "MSFT - Microsoft Corporation" },
    { value: "GOOGL", label: "GOOGL - Alphabet Inc." },
    { value: "AMZN", label: "AMZN - Amazon.com Inc." },
    { value: "META", label: "META - Meta Platforms Inc." },
    { value: "TSLA", label: "TSLA - Tesla, Inc." },
    { value: "NVDA", label: "NVDA - NVIDIA Corporation" },
    { value: "JPM", label: "JPM - JPMorgan Chase & Co." },
    { value: "JNJ", label: "JNJ - Johnson & Johnson" },
    { value: "V", label: "V - Visa Inc." },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(saveConfigSchema),
    defaultValues: {
      name: "",
      timeframe: "1M",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: configsData } = await axios.get(
          `${API_URL}/users/dashboard-configs`
        );

        if (configsData.status === "success") {
          setDashboardConfigs(configsData.data.configs || []);
        }

        if (user && user.favoriteStocks && user.favoriteStocks.length > 0) {
          const formattedStocks = user.favoriteStocks.map((symbol) => {
            const popularStock = popularStockOptions.find(
              (stock) => stock.value === symbol
            );
            return (
              popularStock || {
                value: symbol,
                label: `${symbol} - Stock`,
              }
            );
          });
          setFavoriteStocks(formattedStocks);
        } else {
          setFavoriteStocks([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUpdateError("Failed to load your data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleFavoriteStocksChange = async (newSelection) => {
    setFavoriteStocks(newSelection || []);
    setUpdateError("");

    try {
      await axios.patch(`${API_URL}/users/favorites`, {
        favoriteStocks: (newSelection || []).map((stock) => stock.value),
      });
    } catch (error) {
      console.error("Error updating favorite stocks:", error);
      setUpdateError("Failed to save your favorite stocks. Please try again.");
    }
  };

  const onSaveConfig = async (data) => {
    setSaveSuccess(false);
    setSaveError("");
    setIsSaving(true);

    if (favoriteStocks.length === 0) {
      setSaveError("Please select at least one stock");
      setIsSaving(false);
      return;
    }

    try {
      const { data: response } = await axios.post(
        `${API_URL}/users/dashboard-configs`,
        {
          name: data.name,
          stocks: favoriteStocks.map((stock) => stock.value),
          timeframe: data.timeframe,
        }
      );

      if (response.status === "success") {
        setDashboardConfigs([...dashboardConfigs, response.data.config]);
        setSaveSuccess(true);
        setSaveConfigMode(false);
        reset();
      }
    } catch (error) {
      console.error("Error saving dashboard configuration:", error);
      setSaveError(
        error.response?.data?.message || "Failed to save configuration"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async (configId) => {
    try {
      await axios.delete(`${API_URL}/users/dashboard-configs/${configId}`);

      setDashboardConfigs(
        dashboardConfigs.filter((config) => config._id !== configId)
      );
    } catch (error) {
      console.error("Error deleting dashboard configuration:", error);
      setUpdateError("Failed to delete configuration. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          User Profile
        </h1>

        {updateError && (
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
                  {updateError}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User info card */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-200">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user?.name || "User"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email || "Email not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite stocks card */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Favorite Stocks
                </h2>

                {saveConfigMode ? (
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setSaveConfigMode(false)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm leading-5 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:text-gray-500 dark:hover:text-white focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 mr-2"
                    >
                      <FiX className="mr-1 h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSaveConfigMode(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
                    disabled={favoriteStocks.length === 0}
                  >
                    <FiPlus className="mr-1 h-4 w-4" />
                    Save Configuration
                  </button>
                )}
              </div>

              <div className="mb-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-10 mb-4">
                    <FiLoader className="animate-spin h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Loading stocks...
                    </span>
                  </div>
                ) : (
                  <StockSearchSelect
                    selectedStocks={favoriteStocks}
                    onChange={handleFavoriteStocksChange}
                    maxSelections={10}
                  />
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Add your favorite stocks to track. These will be saved to your
                  profile.
                </p>
                {favoriteStocks.length === 0 && !isLoading && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      No stocks selected yet. Search for stocks like "AAPL" or
                      select from popular options above.
                    </p>
                  </div>
                )}
              </div>

              {saveConfigMode && (
                <form
                  onSubmit={handleSubmit(onSaveConfig)}
                  className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4"
                >
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Save Current Selection as Dashboard Configuration
                  </h3>

                  {saveSuccess && (
                    <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded flex items-center">
                      <FiCheck className="h-4 w-4 mr-2" />
                      Configuration saved successfully!
                    </div>
                  )}

                  {saveError && (
                    <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded flex items-center">
                      <FiX className="h-4 w-4 mr-2" />
                      {saveError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="configName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Configuration Name
                      </label>
                      <input
                        type="text"
                        id="configName"
                        {...register("name")}
                        className="block w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                        placeholder="My Tech Stocks"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="timeframe"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Default Timeframe
                      </label>
                      <select
                        id="timeframe"
                        {...register("timeframe")}
                        className="block w-full border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
                      >
                        <option value="1D">1 Day</option>
                        <option value="1W">1 Week</option>
                        <option value="1M">1 Month</option>
                        <option value="3M">3 Months</option>
                        <option value="1Y">1 Year</option>
                        <option value="YTD">Year to Date</option>
                        <option value="MTD">Month to Date</option>
                      </select>
                      {errors.timeframe && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.timeframe.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <FiLoader className="animate-spin mr-2 h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="mr-2 h-4 w-4" />
                          Save Configuration
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Saved configurations */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Saved Dashboard Configurations
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your saved dashboard configurations for quick access.
                </p>
              </div>

              {isLoading ? (
                <div className="p-6 flex justify-center">
                  <FiLoader className="animate-spin h-6 w-6 text-blue-500 mr-2" />
                  <span>Loading configurations...</span>
                </div>
              ) : dashboardConfigs.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <p>No saved configurations yet.</p>
                  <p className="mt-2 text-sm">
                    Save your current stock selection and timeframe for quick
                    access later.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dashboardConfigs.map((config) => (
                    <li
                      key={config._id}
                      className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">
                            {config.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {config.stocks.map((stock) => (
                              <span
                                key={stock}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              >
                                {stock}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 mr-4">
                            {config.timeframe}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteConfig(config._id)}
                            className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Delete configuration"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {config.createdAt && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Created:{" "}
                          {new Date(config.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
