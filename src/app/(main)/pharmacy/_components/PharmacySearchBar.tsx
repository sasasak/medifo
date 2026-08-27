'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PharmacySearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSelectPlace: (place: { name: string; x: string; y: string }) => void;
}

export default function PharmacySearchBar({
  searchQuery,
  setSearchQuery,
  onSelectPlace,
}: PharmacySearchBarProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const psRef = useRef<any>(null);

  useEffect(() => {
    const initPs = () => {
      if (window.kakao?.maps?.services) {
        psRef.current = new window.kakao.maps.services.Places();
      }
    };

    if (window.kakao?.maps?.services) {
      initPs();
    } else {
      window.addEventListener('kakaoLoaded', initPs);
      return () => window.removeEventListener('kakaoLoaded', initPs);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || !psRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    psRef.current.keywordSearch(
      searchQuery,
      (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSuggestions(data);
          setShowSuggestions(true);
          setActiveIndex(-1);
        }
      },
      {
        category_group_code: 'PM9',
      },
    );
  }, [searchQuery]);

  const handleSelect = (place: any) => {
    setSearchQuery(place.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onSelectPlace({ name: place.place_name, x: place.x, y: place.y });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search size={18} className="text-text-muted absolute left-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="지역 또는 약국 이름을 검색하세요"
          className="bg-card border-border-light focus:border-border-focus w-full rounded-2xl border py-3 pr-10 pl-10 text-sm outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute right-4 cursor-pointer"
          >
            <X size={16} className="text-text-muted" />
          </button>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="bg-card border-border-light absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border">
          {suggestions.map((place, index) => (
            <button
              key={place.id}
              type="button"
              onClick={() => handleSelect(place)}
              className={`border-border-light flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors last:border-none ${
                index === activeIndex ? 'bg-card-muted' : 'hover:bg-card-muted'
              }`}
            >
              <span className="text-sm font-bold">{place.place_name}</span>
              <span className="text-text-muted text-xs">
                {place.address_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
