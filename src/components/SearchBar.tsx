'use client';

import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        // (e.g. you could add `types: ['(cities)'], fields: ['name','geometry'],` etc.)
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      onPlaceSelected({
        name: place.name || '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id || '',
      });
    });
  }, [onPlaceSelected]); // ← Added `onPlaceSelected` here

  return (
    <div className="relative z-[999] mt-6 w-full max-w-md mx-auto px-4">
      <input
        ref={inputRef}
        className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
        placeholder="Input Location"
      />
    </div>
  );
}
