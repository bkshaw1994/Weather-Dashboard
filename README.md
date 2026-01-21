# Weather Dashboard

A modern, real-time weather dashboard built with Next.js, TypeScript, Tailwind CSS, and Chart.js. Get current weather conditions and forecasts for any city worldwide using the free Open-Meteo API.

## Features

- 🌤️ Real-time weather data from Open-Meteo API (completely free!)
- 📊 Interactive temperature charts with Chart.js
- 🔍 City search functionality
- 📱 Responsive design for all devices
- 🌓 Dark mode support
- 📈 7-day weather forecast with hourly data
- 💨 Detailed weather metrics (humidity, wind speed, pressure, etc.)
- 🔓 **No API key required!**

## Getting Started

### Prerequisites

- Node.js 18+ installed
- No API key needed! 🎉

### Installation

1. Clone or navigate to the project directory:

```bash
cd weather
```

2. Install dependencies:

```bash
npm install
```

3. That's it! No API key configuration needed.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
weather/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── SearchBar.tsx      # City search component
│   ├── WeatherCard.tsx    # Main weather display
│   ├── WeatherDetails.tsx # Detailed metrics
│   ├── TemperatureChart.tsx # Temperature chart
│   └── ForecastCards.tsx  # 5-day forecast
├── lib/                   # Utility functions
│   └── weatherApi.ts      # OpenWeather API integration
├── types/                 # TypeScript definitions
│   └── weather.ts         # Weather data types
└── public/                # Static assets
```

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **React-chartjs-2** - Chart.js React wrapper
- **Axios** - HTTP client
- **Open-Meteo API** - Free weather data (no API key required!)

## Features Explained

### Current Weather

- Temperature and "feels like" temperature
- Weather conditions with icons
- City and country information

### Weather Details

- Humidity percentage
- Wind speed
- Atmospheric pressure
- Cloudiness
- Min/Max temperatures

### 24-Hour Chart

- Temperature trends over 24 hours
- 3-hour interval data points
- Interactive line chart

### 5-Day Forecast

- Daily weather predictions
- Temperature and conditions
- Weather icons for each day

## API Usage

This app uses the **Open-Meteo API** - a free, open-source weather API:

- No API key required
- No registration needed
- Unlimited requests
- High-quality weather data from national weather services

API endpoints used:

- Geocoding: Convert city names to coordinates
- Weather Forecast: Current weather and 7-day hourly forecasts

Learn more at [open-meteo.com](https://open-meteo.com)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
