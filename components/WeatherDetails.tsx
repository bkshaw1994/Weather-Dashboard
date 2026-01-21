"use client";

import type { WeatherData } from "@/types/weather";

interface WeatherDetailsProps {
    data: WeatherData;
}

export default function WeatherDetails({ data }: WeatherDetailsProps) {
    const details = [
        {
            label: "Humidity",
            value: `${data.main.humidity}%`,
            icon: "💧",
        },
        {
            label: "Wind Speed",
            value: `${data.wind.speed} m/s`,
            icon: "💨",
        },
        {
            label: "Pressure",
            value: `${data.main.pressure} hPa`,
            icon: "🌡️",
        },
        {
            label: "Cloudiness",
            value: `${data.clouds.all}%`,
            icon: "☁️",
        },
        {
            label: "Min Temp",
            value: `${Math.round(data.main.temp_min)}°C`,
            icon: "🔽",
        },
        {
            label: "Max Temp",
            value: `${Math.round(data.main.temp_max)}°C`,
            icon: "🔼",
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                Weather Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {details.map((detail, index) => (
                    <div
                        key={index}
                        className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">{detail.icon}</span>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {detail.label}
                                </p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">
                                    {detail.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
