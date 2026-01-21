"use client";

import { getWeatherIconUrl } from "@/lib/weatherApi";
import type { ForecastData } from "@/types/weather";

interface ForecastCardsProps {
    data: ForecastData;
}

export default function ForecastCards({ data }: ForecastCardsProps) {
    // Group forecasts by day and take one per day (around noon)
    const dailyForecasts = data.list.filter((item) => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        return hour >= 11 && hour <= 13;
    }).slice(0, 5);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                5-Day Forecast
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {dailyForecasts.map((forecast, index) => {
                    const date = new Date(forecast.dt * 1000);
                    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
                    const temp = Math.round(forecast.main.temp);
                    const icon = forecast.weather[0].icon;
                    const description = forecast.weather[0].description;

                    return (
                        <div
                            key={index}
                            className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                        >
                            <p className="font-bold text-gray-800 dark:text-white mb-2">
                                {dayName}
                            </p>
                            <img
                                src={getWeatherIconUrl(icon)}
                                alt={description}
                                className="w-16 h-16 mx-auto"
                            />
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                {temp}°C
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 capitalize mt-1">
                                {description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
