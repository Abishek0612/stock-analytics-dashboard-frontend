"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import { useStockData } from "@/hooks/useStockData";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingScreen from "@/components/ui/LoadingScreen";
import ChartErrorFallback from "@/components/charts/ChartErrorFallback";
import {
  FiCalendar,
  FiInfo,
  FiLoader,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { ErrorBoundary } from "react-error-boundary";

const DatePicker = dynamic(() => import("react-datepicker"), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
  ),
});

const StockSearchSelect = dynamic(
  () => import("@/components/ui/StockSearchSelect"),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
    ),
  }
);

const StockChart = dynamic(() => import("@/components/charts/StockChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <FiLoader className="animate-spin h-8 w-8 text-blue-500 mr-3" />
      <span className="text-gray-700 dark:text-gray-300">
        Loading chart components...
      </span>
    </div>
  ),
});

import "react-datepicker/dist/react-datepicker.css";

const DEFAULT_STOCKS = [
  { value: "AAPL", label: "AAPL - Apple Inc." },
  { value: "MSFT", label: "MSFT - Microsoft Corporation" },
  { value: "GOOGL", label: "GOOGL - Alphabet Inc." },
];

const TIMEFRAME_OPTIONS = [
  { value: "1D", label: "1 Day" },
  { value: "1W", label: "1 Week" },
  { value: "1M", label: "1 Month" },
  { value: "3M", label: "3 Months" },
  { value: "1Y", label: "1 Year" },
  { value: "YTD", label: "Year to Date" },
  { value: "MTD", label: "Month to Date" },
  { value: "custom", label: "Custom Range" },
];

export default function DashboardPage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [chartKey, setChartKey] = useState(Date.now());
  const [selectedStocks, setSelectedStocks] = useState(DEFAULT_STOCKS);
  const [timeframe, setTimeframe] = useState(TIMEFRAME_OPTIONS[2]);

  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const [startDate, setStartDate] = useState(oneMonthAgo);
  const [endDate, setEndDate] = useState(today);
  const [dataKey, setDataKey] = useState(Date.now());
  const [tableError, setTableError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const customRange = useMemo(() => {
    if (timeframe.value !== "custom") return null;

    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    return {
      start: formatDate(startDate),
      end: formatDate(endDate),
    };
  }, [timeframe.value, startDate, endDate]);

  const { data, isLoading, error, refetch } = useStockData(
    selectedStocks,
    timeframe.value,
    customRange
  );

  useEffect(() => {
    setDataKey(Date.now());
    setChartKey(Date.now());
  }, [timeframe, customRange]);

  const handleStockChange = (newSelection) => {
    if (!newSelection || newSelection.length === 0) {
      setSelectedStocks([]);
    } else {
      setSelectedStocks(newSelection);
    }
    setDataKey(Date.now());
    setChartKey(Date.now());
  };

  const handleTimeframeChange = (e) => {
    const selected = TIMEFRAME_OPTIONS.find(
      (option) => option.value === e.target.value
    );
    setTimeframe(selected);
  };

  const handleChartReset = useCallback(() => {
    setChartKey(Date.now());
    refetch();
  }, [refetch]);

  const stockPerformanceData = useMemo(() => {
    setTableError(null);

    if (
      !data ||
      Object.keys(data).length === 0 ||
      !selectedStocks ||
      selectedStocks.length === 0
    ) {
      return [];
    }

    try {
      return selectedStocks.map((stock) => {
        const tickerData = data[stock.value] || [];

        if (
          !tickerData ||
          !Array.isArray(tickerData) ||
          tickerData.length === 0 ||
          !tickerData[0] ||
          tickerData[0].close === undefined
        ) {
          return {
            symbol: stock.value,
            noData: true,
          };
        }

        tickerData.sort((a, b) => new Date(a.date) - new Date(b.date));

        const startPrice = tickerData[0].close;
        const endPrice = tickerData[tickerData.length - 1].close;
        const change = endPrice - startPrice;
        const percentChange = (change / startPrice) * 100;
        const high = Math.max(...tickerData.map((data) => data.high || 0));
        const low = Math.min(...tickerData.map((data) => data.low || Infinity));

        return {
          symbol: stock.value,
          startPrice,
          endPrice,
          change,
          percentChange,
          high,
          low,
          noData: false,
        };
      });
    } catch (err) {
      console.error("Error calculating performance data:", err);
      setTableError("Failed to calculate stock performance. Please try again.");
      return [];
    }
  }, [data, selectedStocks, dataKey]);

  if (initialLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Stock Analytics Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Stock selection */}
          <div className="lg:col-span-2">
            <label
              htmlFor="stocks"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select Stocks (max 5)
            </label>
            <Suspense
              fallback={
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              }
            >
              <StockSearchSelect
                selectedStocks={selectedStocks}
                onChange={handleStockChange}
                maxSelections={5}
              />
            </Suspense>
          </div>

          {/* Timeframe selection */}
          <div>
            <label
              htmlFor="timeframe"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Timeframe
            </label>
            <select
              id="timeframe"
              value={timeframe.value}
              onChange={handleTimeframeChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {TIMEFRAME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {timeframe.value === "custom" && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <Suspense
                    fallback={
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    }
                  >
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      maxDate={new Date()}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </Suspense>
                  <FiCalendar className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="relative flex-1">
                  <Suspense
                    fallback={
                      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    }
                  >
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      maxDate={new Date()}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </Suspense>
                  <FiCalendar className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chart section */}
        <div className="mb-6">
          {isLoading ? (
            <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <FiLoader className="animate-spin h-8 w-8 text-blue-500 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">
                Loading stock data...
              </span>
            </div>
          ) : error ? (
            <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="flex flex-col items-center">
                <FiAlertCircle className="h-8 w-8 text-red-500 mb-3" />
                <span className="text-red-600 dark:text-red-400 mb-4">
                  {error}
                </span>
                <button
                  onClick={refetch}
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                >
                  <FiRefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </button>
              </div>
            </div>
          ) : selectedStocks.length === 0 ? (
            <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <FiInfo className="h-8 w-8 text-blue-500 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">
                Please select at least one stock to display the chart
              </span>
            </div>
          ) : (
            <ErrorBoundary
              key={chartKey}
              FallbackComponent={({ error, resetErrorBoundary }) => (
                <ChartErrorFallback
                  error={error}
                  resetErrorBoundary={resetErrorBoundary}
                />
              )}
              onReset={handleChartReset}
            >
              <Suspense
                fallback={
                  <div className="w-full h-96 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <FiLoader className="animate-spin h-8 w-8 text-blue-500 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Preparing chart...
                    </span>
                  </div>
                }
              >
                <StockChart
                  key={dataKey}
                  data={data}
                  tickers={selectedStocks.map((stock) => stock.value)}
                  timeframe={timeframe.value}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </div>

        {/* Stock details table */}
        {selectedStocks.length > 0 && Object.keys(data).length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Stock Performance Summary
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Key metrics for selected stocks over the{" "}
                {timeframe.value === "custom"
                  ? "custom"
                  : timeframe.label.toLowerCase()}{" "}
                period.
              </p>
            </div>

            {tableError && (
              <div className="mx-4 my-2 p-2 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {tableError}
              </div>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Symbol
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Start Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        End Price
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Change
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        % Change
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        High
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Low
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {stockPerformanceData.map((stock) => {
                      if (stock.noData) {
                        return (
                          <tr key={stock.symbol}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {stock.symbol}
                            </td>
                            <td
                              colSpan={6}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                            >
                              No data available for this stock
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={stock.symbol}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {stock.symbol}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${stock.startPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${stock.endPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                stock.change >= 0
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {stock.change >= 0 ? "+" : ""}
                              {stock.change.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                stock.percentChange >= 0
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {stock.percentChange >= 0 ? "+" : ""}
                              {stock.percentChange.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${stock.high.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${stock.low.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
