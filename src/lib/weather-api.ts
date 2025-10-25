/**
 * Weather API utility functions
 * Uses WeatherAPI.com to fetch real-time weather data
 */

const WEATHER_API_KEY = import.meta.env.VITE_WEATHERAPI_KEY;
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  currentTemp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  rainfall: number;
  description: string;
  windSpeed: number;
  forecast?: Array<{
    date: string;
    temp: number;
    condition: string;
  }>;
}

/**
 * Fetches current weather data for the given location
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  console.log("Fetching weather data... API Key configured:", !!WEATHER_API_KEY);
  
  if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_api_key_here') {
    console.warn("OpenWeatherMap API key not configured. Using mock data.");
    return getMockWeatherData();
  }

  try {
    // Fetch current weather and 5-day forecast from OpenWeatherMap
    const currentUrl = `${WEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const forecastUrl = `${WEATHER_API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    console.log("Fetching OpenWeatherMap data...");
    
    // Fetch both current weather and forecast
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      if (currentResponse.status === 401 || forecastResponse.status === 401) {
        console.error("OpenWeatherMap authentication failed. Please check your API key.");
        console.error("Get your free API key from: https://openweathermap.org/api");
        return getMockWeatherData();
      }
      console.error("OpenWeatherMap request failed");
      return getMockWeatherData();
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // Extract current weather
    const currentTemp = currentData.main.temp;
    const humidity = currentData.main.humidity;
    const windSpeed = currentData.wind?.speed || 0; // Already in m/s
    const description = currentData.weather[0]?.description || "Clear sky";

    // Extract forecast data
    const forecastList = forecastData.list || [];
    
    // Calculate temperature range from forecast
    const temps = forecastList.map((item: any) => item.main.temp);
    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);

    // Calculate total rainfall from forecast
    const totalRainfall = forecastList.reduce((sum: number, item: any) => 
      sum + (item.rain?.['3h'] || 0), 0
    );

    // Format forecast for the next 7 days (grouped by day)
    const forecast = forecastList
      .filter((_: any, i: number) => i % 8 === 0) // Get one forecast per day
      .slice(0, 7)
      .map((item: any) => ({
        date: item.dt_txt.split(' ')[0],
        temp: item.main.temp,
        condition: item.weather[0]?.description || "Clear"
      }));

    return {
      currentTemp,
      tempMin,
      tempMax,
      humidity,
      rainfall: totalRainfall,
      description,
      windSpeed,
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
function getMockWeatherData(): WeatherData {
  return {
    currentTemp: 20,
    humidity: 78,
    rainfall: 45,
    tempMin: 15,
    tempMax: 28,
    description: "Partly cloudy",
    windSpeed: 2.5,
  };
}

