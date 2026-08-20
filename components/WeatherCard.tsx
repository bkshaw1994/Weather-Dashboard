"use client";

import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Thermometer,
  Calendar,
} from "lucide-react";
import type { WeatherData } from "@/types/weather";

interface WeatherCardProps {
  data: WeatherData;
  isCelsius: boolean;
}

export function getWeatherIcon(code: number, className = "w-16 h-16") {
  // Open-Meteo weather codes mapping
  if (code === 0 || code === 1) {
    return <Sun className={`${className} text-amber-400 animate-pulse-slow`} />;
  }
  if (code === 2) {
    return <CloudSun className={`${className} text-amber-300`} />;
  }
  if (code === 3) {
    return <Cloud className={`${className} text-slate-300`} />;
  }
  if (code >= 45 && code <= 48) {
    return <CloudFog className={`${className} text-teal-300`} />;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={`${className} text-blue-400`} />;
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return <CloudSnow className={`${className} text-cyan-200`} />;
  }
  if (code >= 95) {
    return <CloudLightning className={`${className} text-purple-400`} />;
  }
  return <CloudSun className={`${className} text-amber-300`} />;
}

export default function WeatherCard({ data, isCelsius }: WeatherCardProps) {
  const formatTemp = (tempC: number) => {
    if (isCelsius) return `${Math.round(tempC)}°C`;
    return `${Math.round((tempC * 9) / 5 + 32)}°F`;
  };

  const weather = data.weather[0];
  const weatherCode = weather.id;
  const description = weather.description;

  const dateFormatted = new Date(data.dt * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 md:p-8 mb-8 border border-white/15 shadow-2xl transition-all duration-500">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Column: Location & Main Weather Icon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-inner flex items-center justify-center shrink-0">
            {getWeatherIcon(weatherCode, "w-16 h-16 md:w-20 md:h-20")}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wider uppercase mb-1">
              <Calendar className="w-3.5 h-3.5" />
              {dateFormatted}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {data.name}
              {data.sys.country ? `, ${data.sys.country}` : ""}
            </h2>
            <p className="text-base md:text-lg text-slate-300 font-medium capitalize mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block animate-ping" />
              {description}
            </p>
          </div>
        </div>

        {/* Right Column: Temperatures & Details Badges */}
        <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pt-4 md:pt-0 border-t border-slate-800/80 md:border-t-0">
          <div className="text-left md:text-right">
            <div className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tighter">
              {formatTemp(data.main.temp)}
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1 justify-start md:justify-end">
              <Thermometer className="w-4 h-4 text-cyan-400" />
              Feels like <span className="text-slate-200 font-semibold">{formatTemp(data.main.feels_like)}</span>
            </p>
          </div>

          {/* High / Low Temp Pills */}
          <div className="flex items-center gap-2 mt-3">
            <span className="glass-chip px-3 py-1 rounded-full text-xs text-rose-300 font-medium border border-rose-500/20">
              High: {formatTemp(data.main.temp_max)}
            </span>
            <span className="glass-chip px-3 py-1 rounded-full text-xs text-cyan-300 font-medium border border-cyan-500/20">
              Low: {formatTemp(data.main.temp_min)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
