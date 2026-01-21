"use client";

import { getWeatherIconUrl } from "@/lib/weatherApi";
import type { WeatherData } from "@/types/weather";

interface WeatherCardProps {
    data: WeatherData;
}

export default function WeatherCard({ data }: WeatherCardProps) {
    const temperature = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const weatherDescription = data.weather[0].description;
    const weatherIcon = data.weather[0].icon;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-4 md:mb-0">
                    <img
                        src={getWeatherIconUrl(weatherIcon)}
                        alt={weatherDescription}
                        className="w-24 h-24"
                    />
                    <div className="ml-4">
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
                            {data.name}, {data.sys.country}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 capitalize">
                            {weatherDescription}
                        </p>
                    </div>
                </div>

                <div className="text-center md:text-right">
                    <div className="text-6xl font-bold text-gray-800 dark:text-white">
                        {temperature}°C
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Feels like {feelsLike}°C
                    </p>
                </div>
            </div>
        </div>
    );
}
