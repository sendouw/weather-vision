"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Props {
  onPlaceSelected: (location: {
    name: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => void;
}

// Declare the autocomplete element type
declare global {
  interface Window {
    google: typeof google;
    initializeGoogleMapsPromise?: Promise<void>;
  }
}

export default function SearchBar({ onPlaceSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Check for API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Initialize Google Maps with singleton pattern
  const initializeGoogleMaps = useCallback(async () => {
    if (isInitializing || !apiKey) return;

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setIsGoogleLoaded(true);
      return;
    }

    // Use singleton promise to prevent multiple loads
    if (!window.initializeGoogleMapsPromise) {
      setIsInitializing(true);

      window.initializeGoogleMapsPromise = new Promise(async (resolve, reject) => {
        try {
          const loader = new Loader({
            apiKey: apiKey,
            version: "weekly",
            libraries: ["places", "marker"],
          });

          await loader.load();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }

    try {
      await window.initializeGoogleMapsPromise;
      setIsGoogleLoaded(true);
      setError(null);
    } catch (err) {
      console.error("Failed to load Google Maps:", err);
      setError("Unable to load Google Maps. Please check your connection.");
    } finally {
      setIsInitializing(false);
    }
  }, [apiKey, isInitializing]);

  // Initialize legacy Autocomplete API
  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || !isGoogleLoaded) return;
  
    try {
      // Clear any existing autocomplete
      if (autocompleteRef.current) {
        autocompleteRef.current = null;
      }
  
      // Ensure the library is loaded
      await window.google.maps.importLibrary("places");
  
      // Use the global constructor after loading
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ["name", "geometry", "place_id", "formatted_address"],
      });
  
      autocompleteRef.current = autocomplete;
  
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
  
        if (!place.geometry?.location) {
          setError("Please select a valid location");
          return;
        }
  
        const placeName = place.name || place.formatted_address || "Unknown Location";
        setInputValue(placeName);
  
        onPlaceSelected({
          name: placeName,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id || "",
        });
  
        setError(null);
  
        if (window.innerWidth < 768) {
          inputRef.current?.blur();
        }
      });
  
    } catch (err) {
      console.error("Failed to initialize autocomplete:", err);
      setError("Search functionality unavailable");
    }
  }, [isGoogleLoaded, onPlaceSelected]);

  // Initialize on mount
  useEffect(() => {
    if (!apiKey) {
      setError("Google Maps API key is missing");
      return;
    }

    initializeGoogleMaps();
  }, [apiKey, initializeGoogleMaps]);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (isGoogleLoaded && inputRef.current) {
      initializeAutocomplete();
    }
  }, [isGoogleLoaded, initializeAutocomplete]);

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (error && value) {
      setError(null);
    }
  }, [error]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setInputValue("");
      setError(null);
      inputRef.current?.blur();
    }

    if (e.key === "Enter") {
      e.preventDefault();
    }
  }, []);

  // Handle focus
  const handleFocus = useCallback(() => {
    setError(null);
    inputRef.current?.select();
  }, []);

  // Retry initialization
  const handleRetry = useCallback(() => {
    setError(null);
    setInputValue("");
    window.initializeGoogleMapsPromise = undefined;
    initializeGoogleMaps();
  }, [initializeGoogleMaps]);

  return (
    <div className="relative z-50 mt-6 w-full max-w-md mx-auto px-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={
            error
              ? "Search unavailable..."
              : isInitializing
              ? "Loading..."
              : "Search for a location..."
          }
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          disabled={!!error || isInitializing}
          autoComplete="off"
          className={`
            w-full
            rounded-md
            border ${
              error
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }
            bg-white px-4 py-3
            shadow-sm
            focus:outline-none
            focus:ring-2
            text-gray-900
            text-base
            disabled:bg-gray-50
            disabled:cursor-not-allowed
          `}
          style={{
            fontSize: "16px",
            WebkitTextSizeAdjust: "100%"
          }}
        />

        {/* Clear button */}
        {inputValue && !error && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
            aria-label="Clear"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Retry button */}
        {error && !error.includes("API key") && (
          <button
            type="button"
            onClick={handleRetry}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 p-2"
            aria-label="Retry"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
          {error.includes("API key") && (
            <div className="mt-1 text-xs">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isInitializing && !error && (
        <div className="mt-2 text-sm text-gray-500">
          Loading search...
        </div>
      )}
    </div>
  );
}