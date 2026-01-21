import axios from "axios";
import type { WeatherData, ForecastData } from "@/types/weather";

const BASE_URL_GEOCODING = "https://geocoding-api.open-meteo.com/v1";
const BASE_URL_WEATHER = "https://api.open-meteo.com/v1";

// Helper function to get coordinates from city name
async function getCoordinates(
  city: string,
): Promise<{ lat: number; lon: number; name: string; country: string }> {
  try {
    const response = await axios.get(`${BASE_URL_GEOCODING}/search`, {
      params: {
        name: city,
        count: 1,
        language: "en",
        format: "json",
      },
    });

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(
        "City not found. Please check the spelling and try again.",
      );
    }

    const location = response.data.results[0];
    return {
      lat: location.latitude,
      lon: location.longitude,
      name: location.name,
      country: location.country_code || location.country || "",
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to find city location.");
  }
}

// Weather code to description mapping
function getWeatherDescription(code: number): {
  main: string;
  description: string;
  icon: string;
} {
  const weatherCodes: {
    [key: number]: { main: string; description: string; icon: string };
  } = {
    0: { main: "Clear", description: "clear sky", icon: "01d" },
    1: { main: "Clear", description: "mainly clear", icon: "01d" },
    2: { main: "Clouds", description: "partly cloudy", icon: "02d" },
    3: { main: "Clouds", description: "overcast", icon: "03d" },
    45: { main: "Fog", description: "foggy", icon: "50d" },
    48: { main: "Fog", description: "depositing rime fog", icon: "50d" },
    51: { main: "Drizzle", description: "light drizzle", icon: "09d" },
    53: { main: "Drizzle", description: "moderate drizzle", icon: "09d" },
    55: { main: "Drizzle", description: "dense drizzle", icon: "09d" },
    61: { main: "Rain", description: "slight rain", icon: "10d" },
    63: { main: "Rain", description: "moderate rain", icon: "10d" },
    65: { main: "Rain", description: "heavy rain", icon: "10d" },
    71: { main: "Snow", description: "slight snow", icon: "13d" },
    73: { main: "Snow", description: "moderate snow", icon: "13d" },
    75: { main: "Snow", description: "heavy snow", icon: "13d" },
    77: { main: "Snow", description: "snow grains", icon: "13d" },
    80: { main: "Rain", description: "slight rain showers", icon: "09d" },
    81: { main: "Rain", description: "moderate rain showers", icon: "09d" },
    82: { main: "Rain", description: "violent rain showers", icon: "09d" },
    85: { main: "Snow", description: "slight snow showers", icon: "13d" },
    86: { main: "Snow", description: "heavy snow showers", icon: "13d" },
    95: { main: "Thunderstorm", description: "thunderstorm", icon: "11d" },
    96: {
      main: "Thunderstorm",
      description: "thunderstorm with slight hail",
      icon: "11d",
    },
    99: {
      main: "Thunderstorm",
      description: "thunderstorm with heavy hail",
      icon: "11d",
    },
  };

  return (
    weatherCodes[code] || {
      main: "Unknown",
      description: "unknown",
      icon: "01d",
    }
  );
}

export async function getWeatherData(city: string): Promise<WeatherData> {
  try {
    const { lat, lon, name, country } = await getCoordinates(city);

    const response = await axios.get(`${BASE_URL_WEATHER}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
        daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset",
        timezone: "auto",
      },
    });

    const data = response.data;
    const current = data.current;
    const daily = data.daily;
    const weather = getWeatherDescription(current.weather_code);

    return {
      name,
      sys: {
        country,
        sunrise: new Date(daily.sunrise[0]).getTime() / 1000,
        sunset: new Date(daily.sunset[0]).getTime() / 1000,
      },
      main: {
        temp: current.temperature_2m,
        feels_like: current.apparent_temperature,
        temp_min: daily.temperature_2m_min[0],
        temp_max: daily.temperature_2m_max[0],
        pressure: current.pressure_msl,
        humidity: current.relative_humidity_2m,
      },
      weather: [
        {
          id: current.weather_code,
          main: weather.main,
          description: weather.description,
          icon: weather.icon,
        },
      ],
      wind: {
        speed: current.wind_speed_10m,
        deg: current.wind_direction_10m,
      },
      clouds: {
        all: current.cloud_cover,
      },
      dt: new Date(current.time).getTime() / 1000,
      timezone: 0,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch weather data. Please try again.");
  }
}

export async function getForecastData(city: string): Promise<ForecastData> {
  try {
    const { lat, lon, name, country } = await getCoordinates(city);

    const response = await axios.get(`${BASE_URL_WEATHER}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
        timezone: "auto",
        forecast_days: 7,
      },
    });

    const data = response.data;
    const hourly = data.hourly;

    // Create forecast items from hourly data
    const forecastList = hourly.time
      .slice(0, 40)
      .map((time: string, index: number) => {
        const weather = getWeatherDescription(hourly.weather_code[index]);

        return {
          dt: new Date(time).getTime() / 1000,
          dt_txt: time,
          main: {
            temp: hourly.temperature_2m[index],
            feels_like: hourly.apparent_temperature[index],
            temp_min: hourly.temperature_2m[index],
            temp_max: hourly.temperature_2m[index],
            pressure: hourly.pressure_msl[index],
            humidity: hourly.relative_humidity_2m[index],
          },
          weather: [
            {
              id: hourly.weather_code[index],
              main: weather.main,
              description: weather.description,
              icon: weather.icon,
            },
          ],
          wind: {
            speed: hourly.wind_speed_10m[index],
            deg: hourly.wind_direction_10m[index],
          },
          clouds: {
            all: hourly.cloud_cover[index],
          },
        };
      });

    return {
      list: forecastList,
      city: {
        name,
        country,
        timezone: 0,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch forecast data. Please try again.");
  }
}

export async function getWeatherByCoordinates(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  try {
    // Get city name from reverse geocoding first
    let cityName = "Current Location";
    let country = "";
    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat,
            lon,
            format: "json",
          },
          headers: {
            "User-Agent": "WeatherDashboard/1.0",
          },
        },
      );
      if (geoResponse.data && geoResponse.data.address) {
        cityName =
          geoResponse.data.address.city ||
          geoResponse.data.address.town ||
          geoResponse.data.address.village ||
          geoResponse.data.address.county ||
          "Current Location";
        country = geoResponse.data.address.country_code?.toUpperCase() || "";
      }
    } catch (e) {
      // Use default if reverse geocoding fails
    }

    const response = await axios.get(`${BASE_URL_WEATHER}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
        daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset",
        timezone: "auto",
      },
    });

    const data = response.data;
    const current = data.current;
    const daily = data.daily;
    const weather = getWeatherDescription(current.weather_code);

    return {
      name: cityName,
      sys: {
        country,
        sunrise: new Date(daily.sunrise[0]).getTime() / 1000,
        sunset: new Date(daily.sunset[0]).getTime() / 1000,
      },
      main: {
        temp: current.temperature_2m,
        feels_like: current.apparent_temperature,
        temp_min: daily.temperature_2m_min[0],
        temp_max: daily.temperature_2m_max[0],
        pressure: current.pressure_msl,
        humidity: current.relative_humidity_2m,
      },
      weather: [
        {
          id: current.weather_code,
          main: weather.main,
          description: weather.description,
          icon: weather.icon,
        },
      ],
      wind: {
        speed: current.wind_speed_10m,
        deg: current.wind_direction_10m,
      },
      clouds: {
        all: current.cloud_cover,
      },
      dt: new Date(current.time).getTime() / 1000,
      timezone: 0,
    };
  } catch (error) {
    throw new Error("Failed to fetch weather data for your location.");
  }
}

export async function getForecastByCoordinates(
  lat: number,
  lon: number,
): Promise<ForecastData> {
  try {
    // Get city name from reverse geocoding
    let cityName = "Current Location";
    let country = "";
    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat,
            lon,
            format: "json",
          },
          headers: {
            "User-Agent": "WeatherDashboard/1.0",
          },
        },
      );
      if (geoResponse.data && geoResponse.data.address) {
        cityName =
          geoResponse.data.address.city ||
          geoResponse.data.address.town ||
          geoResponse.data.address.village ||
          geoResponse.data.address.county ||
          "Current Location";
        country = geoResponse.data.address.country_code?.toUpperCase() || "";
      }
    } catch (e) {
      // Use default if reverse geocoding fails
    }

    const response = await axios.get(`${BASE_URL_WEATHER}/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m",
        timezone: "auto",
        forecast_days: 7,
      },
    });

    const data = response.data;
    const hourly = data.hourly;

    const forecastList = hourly.time
      .slice(0, 40)
      .map((time: string, index: number) => {
        const weather = getWeatherDescription(hourly.weather_code[index]);

        return {
          dt: new Date(time).getTime() / 1000,
          dt_txt: time,
          main: {
            temp: hourly.temperature_2m[index],
            feels_like: hourly.apparent_temperature[index],
            temp_min: hourly.temperature_2m[index],
            temp_max: hourly.temperature_2m[index],
            pressure: hourly.pressure_msl[index],
            humidity: hourly.relative_humidity_2m[index],
          },
          weather: [
            {
              id: hourly.weather_code[index],
              main: weather.main,
              description: weather.description,
              icon: weather.icon,
            },
          ],
          wind: {
            speed: hourly.wind_speed_10m[index],
            deg: hourly.wind_direction_10m[index],
          },
          clouds: {
            all: hourly.cloud_cover[index],
          },
        };
      });

    return {
      list: forecastList,
      city: {
        name: cityName,
        country,
        timezone: 0,
      },
    };
  } catch (error) {
    throw new Error("Failed to fetch forecast data for your location.");
  }
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
