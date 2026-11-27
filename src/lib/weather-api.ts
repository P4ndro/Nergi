/**
 * Weather API utility functions
 * Uses WeatherAPI.com to fetch real-time weather data
 */

const WEATHER_API_KEY = import.meta.env.VITE_WEATHERAPI_KEY;
const WEATHER_API_BASE_URL = "https://api.weatherapi.com/v1";

export interface WeatherData {
  currentTemp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rainfall: number;
  description: string;
  windSpeed: number;
  /** True when this is a generic estimate rather than a live forecast for the user's location. */
  isEstimate: boolean;
  forecast?: Array<{
    date: string;
    temp: number;
    condition: string;
  }>;
}

/**
 * Fetches current weather data for the given location
 */
interface ForecastDay {
  date: string;
  day: {
    mintemp_c: number;
    maxtemp_c: number;
    avgtemp_c: number;
    totalprecip_mm?: number;
    condition: { text: string };
  };
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    console.warn("WeatherAPI key not configured. Using mock data.");
    return getMockWeatherData();
  }

  try {
    // Fetch current weather and forecast
    const response = await fetch(
      `${WEATHER_API_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=7&aqi=no&alerts=no`
    );

    if (!response.ok) {
      console.error("WeatherAPI request failed:", response.status, response.statusText);
      return getMockWeatherData();
    }

    const data = await response.json();

    // Extract current weather
    const current = data.current;
    const currentTemp = current.temp_c;
    const humidity = current.humidity;
    const windSpeed = current.wind_mps || current.wind_kph / 3.6; // Convert km/h to m/s
    const description = current.condition.text;

    // Extract forecast data
    const forecastData: ForecastDay[] = data.forecast?.forecastday || [];
    
    // Calculate temperature range from forecast
    const temps = forecastData.map((day) => ({
      min: day.day.mintemp_c,
      max: day.day.maxtemp_c,
    }));
    
    const tempMin = temps.length ? Math.min(...temps.map((t) => t.min)) : currentTemp;
    const tempMax = temps.length ? Math.max(...temps.map((t) => t.max)) : currentTemp;

    // Calculate total rainfall
    const totalRainfall = forecastData.reduce((sum, day) => sum + (day.day.totalprecip_mm || 0), 0);

    // Format forecast for the next 7 days
    const forecast = forecastData.map((day) => ({
      date: day.date,
      temp: day.day.avgtemp_c,
      condition: day.day.condition.text,
    }));

    return {
      currentTemp,
      tempMin,
      tempMax,
      humidity,
      rainfall: totalRainfall,
      description,
      windSpeed,
      isEstimate: false,
      forecast,
    };

  } catch (error) {
    console.error("Error fetching weather data:", error);
    return getMockWeatherData();
  }
}

/**
 * Returns mock weather data as a fallback
 */
export function getMockWeatherData(): WeatherData {
  return {
    currentTemp: 20,
    humidity: 78,
    rainfall: 45,
    tempMin: 15,
    tempMax: 28,
    description: "Partly cloudy",
    windSpeed: 2.5,
    isEstimate: true,
  };
}

