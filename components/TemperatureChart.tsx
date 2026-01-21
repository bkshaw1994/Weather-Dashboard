"use client";

import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import type { ForecastData } from "@/types/weather";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TemperatureChartProps {
    data: ForecastData;
}

export default function TemperatureChart({ data }: TemperatureChartProps) {
    // Take first 8 items (24 hours of data, 3-hour intervals)
    const forecastItems = data.list.slice(0, 8);

    const labels = forecastItems.map((item) => {
        const date = new Date(item.dt * 1000);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
        });
    });

    const temperatures = forecastItems.map((item) => Math.round(item.main.temp));

    const chartData = {
        labels,
        datasets: [
            {
                label: "Temperature (°C)",
                data: temperatures,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                },
                ticks: {
                    callback: function (value: any) {
                        return value + "°C";
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                24-Hour Temperature Forecast
            </h3>
            <div className="h-64">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
}
