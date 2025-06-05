'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/** Make TypeScript understand window.google.maps */
declare global {
  interface Window {
    google: typeof google;
  }
}

interface Props {
  onPlaceSelected: (location: {
    name: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => void;
}

export default function SearchBar({ onPlaceSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState('');
  const isSelectingRef = useRef(false);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // If user cleared the input, reset the autocomplete
    if (value === '' && autocompleteRef.current) {
      autocompleteRef.current.set('place', null);
    }
  }, []);

  // Handle keyboard events for better mobile experience
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, and arrow keys to work properly
    if (e.key === 'Escape') {
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, []);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    // Clean up any existing autocomplete
    if (autocompleteRef.current) {
      google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ['name', 'geometry', 'place_id'],
        types: ['geocode', 'establishment'], // Include both addresses and places
      }
    );

    autocompleteRef.current = autocomplete;

    // Handle place selection
    const placeChangedListener = autocomplete.addListener('place_changed', () => {
      isSelectingRef.current = true;
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        isSelectingRef.current = false;
        return;
      }

      // Update the input value with the selected place name
      const placeName = place.name || place.formatted_address || '';
      setInputValue(placeName);
      
      onPlaceSelected({
        name: placeName,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id || '',
      });

      // Reset flag after a delay
      setTimeout(() => {
        isSelectingRef.current = false;
      }, 100);
    });

    // Cleanup
    return () => {
      google.maps.event.removeListener(placeChangedListener);
    };
  }, [onPlaceSelected]);

  // Focus handler to select all text when focused
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for easier editing
    e.target.select();
  }, []);

  return (
    <div className="relative z-[999] mt-6 w-full max-w-md mx-auto px-4">
      <input
        ref={inputRef}
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-base"
        type="text"
        placeholder="Search for a location..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        // Prevent iOS zoom
        style={{ fontSize: '16px' }}
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => {
            setInputValue('');
            inputRef.current?.focus();
          }}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}