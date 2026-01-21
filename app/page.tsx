"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import WeatherCard from "@/components/WeatherCard";
import TemperatureChart from "@/components/TemperatureChart";
import WeatherDetails from "@/components/WeatherDetails";
import ForecastCards from "@/components/ForecastCards";
import { getWeatherData, getForecastData, getWeatherByCoordinates, getForecastByCoordinates } from "@/lib/weatherApi";
import type { WeatherData, ForecastData } from "@/types/weather";

export default function Home() {
    const [city, setCity] = useState("");
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [forecastData, setForecastData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationStatus, setLocationStatus] = useState<string>("Detecting location...");

    useEffect(() => {
        getCurrentLocationWeather();
    }, []);

    const getCurrentLocationWeather = () => {
        setLoading(true);
        setError(null);
        setLocationStatus("Getting your location...");

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        setLocationStatus("Fetching weather for your location...");
                        const { latitude, longitude } = position.coords;
                        const [weather, forecast] = await Promise.all([
                            getWeatherByCoordinates(latitude, longitude),
                            getForecastByCoordinates(latitude, longitude),
                        ]);

                        setWeatherData(weather);
                        setForecastData(forecast);
                        setCity(weather.name);
                        setLocationStatus("Using your current location");
                        setLoading(false);
                    } catch (err) {
                        setLocationStatus("Failed to get location weather");
                        setError(err instanceof Error ? err.message : "Failed to fetch weather data");
                        fetchWeatherData("London");
                    }
                },
                (err) => {
                    let message = "Location access denied. ";
                    if (err.code === 1) {
                        message = "Location permission denied. Please enable location access in your browser settings. ";
                    } else if (err.code === 2) {
                        message = "Location unavailable. Make sure Wi-Fi is enabled and location services are turned on. ";
                    } else if (err.code === 3) {
                        message = "Location request timed out. ";
                    }
                    setLocationStatus(message + "Showing London instead.");
                    fetchWeatherData("London");
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            setLocationStatus("Geolocation not supported. Showing London.");
            fetchWeatherData("London");
        }
    };

    const fetchWeatherData = async (cityName: string) => {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch weather data");
            setWeatherData(null);
            setForecastData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (cityName: string) => {
        setCity(cityName);
        setLocationStatus("");
        fetchWeatherData(cityName);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-800 dark:text-white">
                    Weather Dashboard
                </h1>

                {locationStatus && (
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{locationStatus}</p>
                    </div>
                )}

                <div className="flex justify-center mb-4">
                    <button
                        onClick={getCurrentLocationWeather}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <span>📍</span>
                        Use Current Location
                    </button>
                </div>

                <SearchBar onSearch={handleSearch} />

                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading weather data...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {!loading && !error && weatherData && (
                    <div className="space-y-6">
                        <WeatherCard data={weatherData} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <WeatherDetails data={weatherData} />
                            {forecastData && <TemperatureChart data={forecastData} />}
                        </div>

                        {forecastData && <ForecastCards data={forecastData} />}
                    </div>
                )}
            </div>
        </main>
    );
}
