"use client";

import {
  Droplets,
  Wind,
  Gauge,
  Cloud,
  Sunrise,
  Sunset,
  Compass,
} from "lucide-react";
import type { WeatherData } from "@/types/weather";

interface WeatherDetailsProps {
  data: WeatherData;
}

function getWindDirection(deg: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

function formatTime(timestamp: number): string {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function WeatherDetails({ data }: WeatherDetailsProps) {
  const windDir = getWindDirection(data.wind.deg || 0);

  const metrics = [
    {
      label: "Humidity",
      value: `${data.main.humidity}%`,
      subtext: data.main.humidity > 70 ? "High humidity" : data.main.humidity < 30 ? "Dry air" : "Comfortable",
      icon: Droplets,
      color: "text-blue-400",
      bgGlow: "group-hover:border-blue-500/40",
    },
    {
      label: "Wind Speed",
      value: `${Math.round(data.wind.speed * 3.6)} km/h`, // convert m/s to km/h for better readability
      subtext: `Direction: ${windDir} (${data.wind.deg}°)` ,
      icon: Wind,
      color: "text-cyan-400",
      bgGlow: "group-hover:border-cyan-500/40",
    },
    {
      label: "Pressure",
      value: `${data.main.pressure} hPa`,
      subtext: data.main.pressure > 1013 ? "High pressure" : "Normal pressure",
      icon: Gauge,
      color: "text-purple-400",
      bgGlow: "group-hover:border-purple-500/40",
    },
    {
      label: "Cloudiness",
      value: `${data.clouds.all}%`,
      subtext: data.clouds.all > 80 ? "Overcast" : data.clouds.all > 40 ? "Partly cloudy" : "Clear skies",
      icon: Cloud,
      color: "text-slate-300",
      bgGlow: "group-hover:border-slate-500/40",
    },
    {
      label: "Sunrise",
      value: formatTime(data.sys.sunrise),
      subtext: "Dawn",
      icon: Sunrise,
      color: "text-amber-400",
      bgGlow: "group-hover:border-amber-500/40",
    },
    {
      label: "Sunset",
      value: formatTime(data.sys.sunset),
      subtext: "Dusk",
      icon: Sunset,
      color: "text-orange-400",
      bgGlow: "group-hover:border-orange-500/40",
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" /> Weather Parameters
        </h3>
        <span className="text-xs text-slate-400 glass-chip px-3 py-1 rounded-full">
          Live Conditions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {metrics.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`group glass-panel-interactive rounded-2xl p-4 transition-all duration-300 ${item.bgGlow}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-slate-900/60 border border-white/10 ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {item.label}
                </span>
              </div>

              <div className="mt-1">
                <p className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  {item.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
