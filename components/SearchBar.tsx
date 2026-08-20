"use client";

import { useState } from "react";
import { Search, MapPin, Map, X, Sparkles } from "lucide-react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationClick: () => void;
  onOpenMap: () => void;
  loading: boolean;
}

const POPULAR_CITIES = [
  "London",
  "Tokyo",
  "New York",
  "Paris",
  "Sydney",
  "Dubai",
];

export default function SearchBar({
  onSearch,
  onLocationClick,
  onOpenMap,
  loading,
}: SearchBarProps) {
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  const handleQuickCityClick = (cityName: string) => {
    setCity(cityName);
    onSearch(cityName);
  };

  const handleClear = () => {
    setCity("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 space-y-3">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search any city worldwide (e.g. Tokyo, Berlin)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl glass-input placeholder-slate-400 text-slate-100 text-sm md:text-base focus:outline-none"
          />
          {city && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-full hover:bg-slate-800/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="px-5 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-2xl shadow-lg shadow-cyan-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base shrink-0"
        >
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={onOpenMap}
          disabled={loading}
          title="Select location on world map"
          className="p-3.5 glass-panel-interactive text-purple-400 hover:text-purple-300 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-1.5"
        >
          <Map className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold">Map</span>
        </button>

        <button
          type="button"
          onClick={onLocationClick}
          disabled={loading}
          title="Use current location"
          className="p-3.5 glass-panel-interactive text-cyan-400 hover:text-cyan-300 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </form>

      {/* Quick Favorite Cities */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Popular:
        </span>
        {POPULAR_CITIES.map((popularCity) => (
          <button
            key={popularCity}
            onClick={() => handleQuickCityClick(popularCity)}
            disabled={loading}
            className="glass-chip px-3 py-1 rounded-full text-xs text-slate-300 hover:text-cyan-300 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {popularCity}
          </button>
        ))}
      </div>
    </div>
  );
}
