"use client";

import { useState } from "react";
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
  ScriptableContext,
} from "chart.js";
import { TrendingUp, Thermometer, Wind, Droplets } from "lucide-react";
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
  isCelsius: boolean;
}

type MetricType = "temp" | "wind" | "humidity";

export default function TemperatureChart({ data, isCelsius }: TemperatureChartProps) {
  const [metric, setMetric] = useState<MetricType>("temp");

  // Take first 8 forecast entries (24 hours in 3-hour steps)
  const forecastItems = data.list.slice(0, 8);

  const labels = forecastItems.map((item) => {
    const date = new Date(item.dt * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    });
  });

  const getMetricData = () => {
    switch (metric) {
      case "temp":
        return forecastItems.map((item) =>
          isCelsius
            ? Math.round(item.main.temp)
            : Math.round((item.main.temp * 9) / 5 + 32)
        );
      case "wind":
        return forecastItems.map((item) => Math.round(item.wind.speed * 3.6)); // km/h
      case "humidity":
        return forecastItems.map((item) => item.main.humidity);
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case "temp":
        return `Temperature (${isCelsius ? "°C" : "°F"})`;
      case "wind":
        return "Wind Speed (km/h)";
      case "humidity":
        return "Humidity (%)";
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case "temp":
        return { border: "rgb(56, 189, 248)", fillTop: "rgba(56, 189, 248, 0.35)", fillBottom: "rgba(56, 189, 248, 0.0)" };
      case "wind":
        return { border: "rgb(168, 85, 247)", fillTop: "rgba(168, 85, 247, 0.35)", fillBottom: "rgba(168, 85, 247, 0.0)" };
      case "humidity":
        return { border: "rgb(59, 130, 246)", fillTop: "rgba(59, 130, 246, 0.35)", fillBottom: "rgba(59, 130, 246, 0.0)" };
    }
  };

  const colors = getMetricColor();

  const chartData = {
    labels,
    datasets: [
      {
        label: getMetricLabel(),
        data: getMetricData(),
        borderColor: colors.border,
        borderWidth: 3,
        pointBackgroundColor: colors.border,
        pointBorderColor: "#0f172a",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointRadius: 4,
        tension: 0.4,
        fill: true,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, colors.fillTop);
          gradient.addColorStop(1, colors.fillBottom);
          return gradient;
        },
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
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "#38bdf8",
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const val = context.raw;
            if (metric === "temp") return `Temp: ${val}${isCelsius ? "°C" : "°F"}`;
            if (metric === "wind") return `Wind: ${val} km/h`;
            return `Humidity: ${val}%`;
          },
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.06)",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            family: "Outfit",
            size: 11,
          },
          callback: function (value: any) {
            if (metric === "temp") return `${value}°`;
            if (metric === "wind") return `${value}k`;
            return `${value}%`;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
          font: {
            family: "Outfit",
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between">
      {/* Header and Tab Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" /> 24-Hour Forecast Trend
        </h3>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 glass-panel p-1 rounded-xl">
          <button
            onClick={() => setMetric("temp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              metric === "temp"
                ? "bg-cyan-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" /> Temp
          </button>
          <button
            onClick={() => setMetric("wind")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              metric === "wind"
                ? "bg-purple-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wind className="w-3.5 h-3.5" /> Wind
          </button>
          <button
            onClick={() => setMetric("humidity")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              metric === "humidity"
                ? "bg-blue-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> Humidity
          </button>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="h-64 sm:h-72 w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
