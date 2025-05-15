"use client";

import { useMemo, useEffect, useState, memo, useRef } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  ),
});

const StockChart = memo(function StockChart({ data, tickers, timeframe }) {
  const [mounted, setMounted] = useState(false);
  const [chartInitialized, setChartInitialized] = useState(false);
  const [chartError, setChartError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleChartError = (err) => {
      console.error("Chart error:", err);
      setChartError(err.message || "Error initializing chart");
      err.stopPropagation?.();
      err.preventDefault?.();
    };

    window.addEventListener("error", handleChartError);

    return () => {
      window.removeEventListener("error", handleChartError);
    };
  }, []);

  useEffect(() => {
    setChartError(null);
  }, [data, tickers, timeframe]);

  useEffect(() => {
    let timer;

    if (mounted && data && Object.keys(data).length > 0) {
      timer = setTimeout(() => {
        setChartInitialized(true);
      }, 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [mounted, data]);

  useEffect(() => {
    if (chartRef.current && chartRef.current.getEchartsInstance) {
      const chart = chartRef.current.getEchartsInstance();

      chart.on("rendered", () => {
        setChartError(null);
      });

      chart.on("error", (err) => {
        console.error("ECharts error event:", err);
        setChartError(
          "Failed to render chart: " + (err.message || "Unknown error")
        );
      });

      return () => {
        chart.off("rendered");
        chart.off("error");
      };
    }
  }, [chartInitialized, chartRef.current]);

  const chartOptions = useMemo(() => {
    try {
      if (!data || Object.keys(data).length === 0) {
        return {
          title: {
            text: "No data available",
            left: "center",
            top: "center",
            textStyle: {
              fontSize: 16,
            },
          },
        };
      }

      const firstTicker = Object.keys(data)[0];
      let firstTickerData = data[firstTicker];

      if (
        !firstTickerData ||
        !Array.isArray(firstTickerData) ||
        firstTickerData.length === 0
      ) {
        return {
          title: {
            text: "No data available for selected timeframe",
            left: "center",
            top: "center",
            textStyle: {
              fontSize: 16,
            },
          },
        };
      }

      firstTickerData.sort((a, b) => new Date(a.date) - new Date(b.date));

      if (timeframe === "1D" && firstTickerData.length > 0) {
        try {
          const dates = firstTickerData.map((item) =>
            new Date(item.date).toDateString()
          );
          const uniqueDates = [...new Set(dates)];

          if (uniqueDates.length > 1) {
            const latestDate = uniqueDates[uniqueDates.length - 1];
            const filteredData = firstTickerData.filter(
              (item) => new Date(item.date).toDateString() === latestDate
            );

            if (filteredData.length > 0) {
              firstTickerData = filteredData;
            }
          }
        } catch (error) {
          console.error("Error filtering for trading hours:", error);
        }
      }

      const formatDateByTimeframe = (dateString, timeframe) => {
        try {
          if (!dateString) return "";

          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.warn("Invalid date:", dateString);
            return "";
          }

          switch (timeframe) {
            case "1D":
              return format(date, "h:mm a");
            case "1W":
              return format(date, "MMM d, h:mm a");
            case "1M":
              return format(date, "MMM d");
            case "3M":
            case "1Y":
            case "YTD":
            case "MTD":
              return format(date, "MMM d, yyyy");
            case "custom":
              return format(date, "MMM d, yyyy");
            default:
              return format(date, "MMM d, yyyy");
          }
        } catch (error) {
          console.error("Date formatting error:", error);
          return dateString || "";
        }
      };

      let xAxisData = [];
      try {
        xAxisData = firstTickerData.map((item) =>
          formatDateByTimeframe(item.date, timeframe)
        );
      } catch (error) {
        console.error("Error creating x-axis data:", error);
        throw new Error("Failed to process date data for chart");
      }

      const series = tickers.map((ticker) => {
        let tickerData = data[ticker];

        if (
          !tickerData ||
          !Array.isArray(tickerData) ||
          tickerData.length === 0
        ) {
          console.warn(`No valid data for ticker ${ticker}`);
          return {
            name: ticker,
            type: "line",
            data: [],
            showSymbol: false,
          };
        }

        tickerData.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (timeframe === "1D" && firstTickerData.length > 0) {
          try {
            const firstDate = new Date(firstTickerData[0].date).toDateString();
            const filteredData = tickerData.filter(
              (item) => new Date(item.date).toDateString() === firstDate
            );

            if (filteredData.length > 0) {
              tickerData = filteredData;
            }
          } catch (error) {
            console.error(`Error filtering data for ${ticker}:`, error);
          }
        }

        try {
          if (tickerData.length === 0) {
            return {
              name: ticker,
              type: "line",
              data: [],
              showSymbol: false,
            };
          }

          const firstClose = tickerData[0].close;
          if (
            firstClose === undefined ||
            firstClose === null ||
            isNaN(firstClose)
          ) {
            console.warn(`Invalid first close value for ${ticker}`);
            return {
              name: ticker,
              type: "line",
              data: [],
              showSymbol: false,
            };
          }

          const percentageData = tickerData.map((item) => {
            if (
              item.close === undefined ||
              item.close === null ||
              isNaN(item.close)
            ) {
              return null;
            }
            return ((item.close - firstClose) / firstClose) * 100;
          });

          const symbolSize =
            timeframe === "1D" ? 4 : timeframe === "1W" ? 3 : 2;

          const showSymbol = ["1D", "1W"].includes(timeframe);

          const smooth = ["1Y", "YTD", "3M"].includes(timeframe);

          return {
            name: ticker,
            type: "line",
            smooth: smooth,
            symbol: "circle",
            symbolSize: symbolSize,
            showSymbol: showSymbol,
            sampling: "average",
            data: percentageData,
            connectNulls: true,
            emphasis: {
              focus: "series",
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.3)",
              },
            },
            animationDuration: 1000,
            animationEasing: "cubicOut",
          };
        } catch (error) {
          console.error(`Error processing data for ticker ${ticker}:`, error);
          return {
            name: ticker,
            type: "line",
            data: [],
            showSymbol: false,
          };
        }
      });

      const dataZoom = ["1Y", "YTD", "3M", "custom"].includes(timeframe)
        ? [
            {
              type: "inside",
              start: 0,
              end: 100,
            },
            {
              start: 0,
              end: 100,
            },
          ]
        : [];

      const colors = [
        "#5470c6",
        "#91cc75",
        "#fac858",
        "#ee6666",
        "#73c0de",
        "#3ba272",
        "#fc8452",
        "#9a60b4",
      ];

      return {
        color: colors,
        title: {
          text: "Stock Performance Comparison",
          left: "center",
          top: 0,
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            if (!params || params.length === 0) return "";

            let tooltip = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;

            params.forEach((param) => {
              if (!param || param.value === undefined) return;

              const color = param.color;
              const value =
                typeof param.value === "number"
                  ? param.value.toFixed(2)
                  : "N/A";

              tooltip += `<div style="display: flex; align-items: center; margin: 3px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%; margin-right: 5px;"></span>
                <span style="margin-right: 5px;">${param.seriesName}:</span>
                <span style="font-weight: bold;">${value}%</span>
              </div>`;
            });

            return tooltip;
          },
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        legend: {
          data: tickers,
          top: 30,
          textStyle: {
            fontSize: 12,
          },
          selected: tickers.reduce((acc, ticker) => {
            acc[ticker] = true;
            return acc;
          }, {}),
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: 70,
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataZoom: {},
            restore: {},
          },
        },
        dataZoom: dataZoom,
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: xAxisData,
          axisLabel: {
            rotate: timeframe === "1D" ? 0 : 45,
            formatter: function (value) {
              return value;
            },
            hideOverlap: true,
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value}%",
          },
          splitLine: {
            lineStyle: {
              type: "dashed",
            },
          },
        },
        series: series,
      };
    } catch (err) {
      console.error("Error creating chart options:", err);
      setChartError(err.message || "Failed to create chart");

      return {
        title: {
          text: "Error creating chart",
          subtext: err.message || "An error occurred while preparing the chart",
          left: "center",
          top: "center",
          textStyle: {
            fontSize: 16,
            color: "#ee6666",
          },
          subtextStyle: {
            fontSize: 14,
            color: "#909399",
          },
        },
      };
    }
  }, [data, tickers, timeframe]);

  // Show loading state if not mounted yet
  if (!mounted) {
    return (
      <div className="w-full h-96 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (chartError) {
    return (
      <div className="w-full h-96 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md flex flex-col items-center justify-center">
        <FiAlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
          Chart Error
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-4 max-w-lg">
          {chartError}
        </p>
        <button
          onClick={() => {
            setChartError(null);
            setChartInitialized(false);
            setTimeout(() => setChartInitialized(true), 100);
          }}
          className="flex items-center px-3 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          <FiRefreshCw className="mr-2" /> Retry Chart
        </button>
      </div>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="w-full h-96 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md flex flex-col items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
          No stock data available
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
          Please select stocks and timeframe
        </p>
      </div>
    );
  }

  const hasValidData = tickers.some((ticker) => {
    const tickerData = data[ticker];
    return tickerData && Array.isArray(tickerData) && tickerData.length > 0;
  });

  if (!hasValidData) {
    return (
      <div className="w-full h-96 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md flex flex-col items-center justify-center">
        <svg
          className="w-12 h-12 text-yellow-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-2">
          No data available for the selected timeframe
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Try selecting a different timeframe or stocks
        </p>
      </div>
    );
  }

  // Show loading spinner if still initializing
  if (!chartInitialized) {
    return (
      <div className="w-full h-96 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-center justify-center">
        <div className="animate-spin mr-3 h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="text-gray-600 dark:text-gray-300">
          Processing chart data...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-96 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md">
      <ReactECharts
        ref={chartRef}
        option={chartOptions}
        style={{ height: "100%", width: "100%" }}
        className="chart-container"
        notMerge={true}
        lazyUpdate={true}
        theme={
          mounted && document.documentElement.classList.contains("dark")
            ? "dark"
            : undefined
        }
        opts={{ renderer: "canvas" }}
        onEvents={{
          renderFailed: (params) => {
            console.error("Render failed:", params);
            setChartError("Chart rendering failed. Please try again.");
          },
        }}
        onChartReady={() => {
          console.log("Chart ready");
          setChartError(null);
        }}
      />
    </div>
  );
});

export default StockChart;
