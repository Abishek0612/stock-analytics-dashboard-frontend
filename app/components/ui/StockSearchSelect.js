import React, { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import axios from "axios";
import Select from "react-select";
import { API_URL } from "@/lib/config";
import Cookies from "js-cookie";
import { FiSearch, FiAlertCircle } from "react-icons/fi";

export default function StockSearchSelect({
  selectedStocks,
  onChange,
  maxSelections = 5,
}) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const debouncedSearchTerm = useDebounce(inputValue, 500);

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

  useEffect(() => {
    if (!debouncedSearchTerm) {
      setOptions(popularStockOptions);
      setError(null);
      return;
    }

    const fetchStocks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const { data } = await axios.get(
          `${API_URL}/stocks/search?query=${debouncedSearchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (data && data.status === "success" && data.data) {
          const stockOptions = data.data
            .filter((stock) => stock.type === "EQUITY")
            .map((stock) => ({
              value: stock.symbol,
              label: `${stock.symbol} - ${stock.name}`,
            }));

          setOptions(
            stockOptions.length > 0 ? stockOptions : popularStockOptions
          );
        } else {
          const filteredPopular = popularStockOptions.filter(
            (stock) =>
              stock.value
                .toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase()) ||
              stock.label
                .toLowerCase()
                .includes(debouncedSearchTerm.toLowerCase())
          );
          setOptions(
            filteredPopular.length > 0
              ? filteredPopular
              : popularStockOptions.slice(0, 3)
          );
        }
      } catch (error) {
        console.error("Error fetching stocks:", error);
        setError("Failed to search stocks. Showing popular options.");

        const filteredPopular = popularStockOptions.filter(
          (stock) =>
            stock.value
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()) ||
            stock.label
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase())
        );
        setOptions(
          filteredPopular.length > 0
            ? filteredPopular
            : popularStockOptions.slice(0, 3)
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, [debouncedSearchTerm]);

  if (!isMounted) {
    return (
      <div className="min-h-[38px] w-full border border-gray-300 dark:border-gray-700 rounded">
        <div className="h-full w-full flex items-center justify-center">
          <span className="text-gray-400">Loading stock selector...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Select
          isMulti
          value={selectedStocks}
          onChange={onChange}
          options={options}
          onInputChange={setInputValue}
          inputValue={inputValue}
          isLoading={isLoading}
          placeholder="Search for stocks or select from popular options..."
          noOptionsMessage={() =>
            debouncedSearchTerm
              ? "No stocks found. Try a different search term."
              : "Type to search for stocks"
          }
          styles={customStyles}
          isOptionDisabled={() => selectedStocks.length >= maxSelections}
          closeMenuOnSelect={false}
          formatOptionLabel={(option) => (
            <div className="flex items-center">
              <span>{option.label}</span>
            </div>
          )}
        />
        {!isLoading && inputValue === "" && options.length > 0 && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FiSearch size={16} />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-1 text-sm text-amber-600 dark:text-amber-400 flex items-center">
          <FiAlertCircle className="mr-1" />
          {error}
        </div>
      )}

      {selectedStocks.length >= maxSelections && (
        <p className="mt-1 text-sm text-red-500">
          Maximum of {maxSelections} stocks can be selected at once
        </p>
      )}

      {selectedStocks.length === 0 && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Search for stocks like "AAPL" or "Google" or select from popular
          options
        </p>
      )}
    </div>
  );
}

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#3b82f6" : provided.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : provided.boxShadow,
    "&:hover": {
      borderColor: state.isFocused ? "#3b82f6" : provided.borderColor,
    },
    backgroundColor: "var(--bg-input, #ffffff)",
    color: "var(--text-primary, #000000)",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--bg-input, #ffffff)",
    zIndex: 10,
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "rgba(59, 130, 246, 0.1)"
      : "var(--bg-input, #ffffff)",
    color: state.isSelected ? "white" : "var(--text-primary, #000000)",
    padding: "10px 12px",
    "&:active": {
      backgroundColor: state.isSelected ? "#3b82f6" : "rgba(59, 130, 246, 0.2)",
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#3b82f6",
    fontWeight: 500,
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "#3b82f6",
    "&:hover": {
      backgroundColor: "#3b82f6",
      color: "white",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "var(--text-secondary, #6b7280)",
  }),
  input: (provided) => ({
    ...provided,
    color: "var(--text-primary, #000000)",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "var(--text-secondary, #6b7280)",
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "var(--text-secondary, #6b7280)",
  }),
};
