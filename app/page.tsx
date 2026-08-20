"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import TemperatureChart from "@/components/TemperatureChart";
import WeatherDetails from "@/components/WeatherDetails";
import ForecastCards from "@/components/ForecastCards";
import {
  getWeatherData,
  getForecastData,
  getWeatherByCoordinates,
  getForecastByCoordinates,
} from "@/lib/weatherApi";
import type { WeatherData, ForecastData } from "@/types/weather";
import { CloudSun, RefreshCw, AlertCircle, Clock } from "lucide-react";

// Dynamically import Leaflet Map Modal with SSR disabled to prevent server-side Leaflet window errors
const LocationMapModal = dynamic(
  () => import("@/components/LocationMapModal"),
  { ssr: false }
);

export default function Home() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Detecting location...");
  const [isCelsius, setIsCelsius] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Map Modal state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number }>({
    lat: 51.5074,
    lon: -0.1278,
  });

  // Update live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = useCallback(async (cityName: string) => {
    setLoading(true);
    setError(null);

    try {
      const [weather, forecast] = await Promise.all([
        getWeatherData(cityName),
        getForecastData(cityName),
      ]);

      setWeatherData(weather);
      setForecastData(forecast);
      setCity(cityName);
      setLocationStatus(`Showing weather for ${cityName}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data."
      );
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCoords = useCallback(
    async (lat: number, lon: number) => {
      setLoading(true);
      setError(null);
      setLocationStatus("Fetching weather for selected coordinates...");

      try {
        const [weather, forecast] = await Promise.all([
          getWeatherByCoordinates(lat, lon),
          getForecastByCoordinates(lat, lon),
        ]);

        setWeatherData(weather);
        setForecastData(forecast);
        setCity(weather.name);
        setMapCoords({ lat, lon });
        setLocationStatus(`Weather for ${weather.name} (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch weather for selected location."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getCurrentLocationWeather = useCallback(() => {
    setLoading(true);
    setError(null);
    setLocationStatus("Getting your position...");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setLocationStatus("Fetching local weather...");
            const { latitude, longitude } = position.coords;
            setMapCoords({ lat: latitude, lon: longitude });
            await fetchWeatherByCoords(latitude, longitude);
          } catch (err) {
            setLocationStatus("Location weather unavailable. Defaulting to London.");
            fetchWeatherData("London");
          }
        },
        () => {
          setLocationStatus("Location access denied. Defaulting to London.");
          fetchWeatherData("London");
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationStatus("Geolocation unavailable. Defaulting to London.");
      fetchWeatherData("London");
    }
  }, [fetchWeatherData, fetchWeatherByCoords]);

  useEffect(() => {
    getCurrentLocationWeather();
  }, [getCurrentLocationWeather]);

  const handleSearch = (cityName: string) => {
    fetchWeatherData(cityName);
  };

  const handleSelectMapLocation = (lat: number, lon: number) => {
    fetchWeatherByCoords(lat, lon);
  };

  // Determine atmospheric background theme based on active weather code
  const getWeatherThemeClass = () => {
    if (!weatherData) return "weather-bg-clear";
    const code = weatherData.weather[0]?.id || 0;
    if (code === 0 || code === 1) return "weather-bg-clear";
    if (code === 2 || code === 3 || (code >= 45 && code <= 48)) return "weather-bg-clouds";
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "weather-bg-rain";
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "weather-bg-snow";
    if (code >= 95) return "weather-bg-thunder";
    return "weather-bg-clear";
  };

  return (
    <main
      className={`min-h-screen ${getWeatherThemeClass()} transition-colors duration-1000 px-4 py-6 md:px-8 md:py-10 text-slate-100`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navbar Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel px-6 py-4 rounded-3xl mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <CloudSun className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                ATMOSPHERE
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Real-Time Weather Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock */}
            {currentTime && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 glass-chip px-3 py-1.5 rounded-full font-medium">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* °C / °F Unit Switcher Toggle */}
            <div className="flex items-center gap-1 glass-panel p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setIsCelsius(true)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  isCelsius
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setIsCelsius(false)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  !isCelsius
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </header>

        {/* Search Bar & City Chips */}
        <SearchBar
          onSearch={handleSearch}
          onLocationClick={getCurrentLocationWeather}
          onOpenMap={() => setIsMapOpen(true)}
          loading={loading}
        />

        {/* Location Status Badge */}
        {locationStatus && !loading && (
          <div className="text-center -mt-4 mb-4">
            <span className="text-xs text-slate-400 bg-slate-900/40 border border-white/5 px-3 py-1 rounded-full">
              {locationStatus}
            </span>
          </div>
        )}

        {/* Shimmer Skeleton Loader */}
        {loading && (
          <div className="space-y-6">
            <div className="h-64 rounded-3xl animate-shimmer glass-panel" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 rounded-3xl animate-shimmer glass-panel" />
              <div className="h-72 rounded-3xl animate-shimmer glass-panel" />
            </div>
            <div className="h-48 rounded-3xl animate-shimmer glass-panel" />
          </div>
        )}

        {/* Error Alert View */}
        {error && !loading && (
          <div className="glass-panel border-rose-500/30 bg-rose-950/30 text-rose-200 p-6 rounded-3xl max-w-xl mx-auto text-center space-y-4 shadow-xl">
            <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400 mb-1">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Unable to Fetch Weather</h3>
            <p className="text-sm text-rose-300">{error}</p>
            <button
              onClick={() => fetchWeatherData(city || "London")}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm rounded-xl transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}

        {/* Weather Dashboard View */}
        {!loading && !error && weatherData && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Main Weather Card */}
            <WeatherCard data={weatherData} isCelsius={isCelsius} />

            {/* Grid Layout: Details & 24h Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <WeatherDetails data={weatherData} />
              {forecastData && (
                <TemperatureChart data={forecastData} isCelsius={isCelsius} />
              )}
            </div>

            {/* Hourly & 5-Day Forecast Sections */}
            {forecastData && (
              <ForecastCards data={forecastData} isCelsius={isCelsius} />
            )}
          </div>
        )}

        {/* Leaflet Interactive Location Map Modal */}
        <LocationMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onSelectLocation={handleSelectMapLocation}
          initialLat={mapCoords.lat}
          initialLon={mapCoords.lon}
        />
      </div>
    </main>
  );
}
