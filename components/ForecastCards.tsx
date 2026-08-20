"use client";

import { Calendar, Clock } from "lucide-react";
import { getWeatherIcon } from "@/components/WeatherCard";
import type { ForecastData } from "@/types/weather";

interface ForecastCardsProps {
  data: ForecastData;
  isCelsius: boolean;
}

export default function ForecastCards({ data, isCelsius }: ForecastCardsProps) {
  const formatTemp = (tempC: number) => {
    if (isCelsius) return `${Math.round(tempC)}°C`;
    return `${Math.round((tempC * 9) / 5 + 32)}°F`;
  };

  // Hourly items (first 8 entries)
  const hourlyItems = data.list.slice(0, 8);

  // Group forecasts by day and take one per day (around noon)
  const dailyForecasts = data.list
    .filter((item) => {
      const date = new Date(item.dt * 1000);
      const hour = date.getHours();
      return hour >= 11 && hour <= 13;
    })
    .slice(0, 5);

  return (
    <div className="space-y-8 mt-8">
      {/* 24-Hour Hourly Forecast Horizontal Carousel */}
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" /> Hourly Forecast
          </h3>
          <span className="text-xs text-slate-400 glass-chip px-3 py-1 rounded-full">
            Next 24 Hours
          </span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {hourlyItems.map((item, index) => {
            const date = new Date(item.dt * 1000);
            const timeStr = date.toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });

            return (
              <div
                key={index}
                className="glass-panel-interactive min-w-[105px] rounded-2xl p-4 text-center shrink-0 flex flex-col items-center justify-between gap-2"
              >
                <span className="text-xs font-semibold text-slate-400">
                  {index === 0 ? "Now" : timeStr}
                </span>

                <div className="my-1">
                  {getWeatherIcon(item.weather[0].id, "w-8 h-8")}
                </div>

                <span className="text-lg font-extrabold text-white">
                  {formatTemp(item.main.temp)}
                </span>

                <span className="text-[10px] text-cyan-400 font-medium">
                  💧 {item.main.humidity}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5-Day Daily Forecast Cards */}
      <div className="glass-panel rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" /> 5-Day Forecast
          </h3>
          <span className="text-xs text-slate-400 glass-chip px-3 py-1 rounded-full">
            Extended Outlook
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {dailyForecasts.map((forecast, index) => {
            const date = new Date(forecast.dt * 1000);
            const dayName =
              index === 0
                ? "Today"
                : date.toLocaleDateString("en-US", { weekday: "short" });
            const dateStr = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const description = forecast.weather[0].description;
            const weatherCode = forecast.weather[0].id;

            return (
              <div
                key={index}
                className="glass-panel-interactive rounded-2xl p-5 text-center flex flex-col items-center justify-between gap-3 group"
              >
                <div>
                  <p className="text-base font-extrabold text-white">
                    {dayName}
                  </p>
                  <p className="text-xs text-slate-400">{dateStr}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/10 my-1 group-hover:scale-110 transition-transform">
                  {getWeatherIcon(weatherCode, "w-10 h-10")}
                </div>

                <div>
                  <p className="text-2xl font-black text-white">
                    {formatTemp(forecast.main.temp)}
                  </p>
                  <p className="text-xs text-slate-300 capitalize mt-1 line-clamp-1">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
