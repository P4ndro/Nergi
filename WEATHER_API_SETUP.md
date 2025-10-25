# Weather API Integration Setup

## Overview

Your Nergi app now fetches **real-time weather data** from the OpenWeatherMap API to provide accurate crop recommendations based on current weather conditions.

## What Data is Fetched

The weather API integration provides:
- **Current temperature** - Real-time weather conditions
- **Temperature range** - Min/max for the next 7 days
- **Humidity** - Average humidity percentage
- **Rainfall forecast** - Expected rainfall in mm
- **Wind speed** - Current wind conditions
- **Weather conditions** - Current weather description
- **Upcoming forecast** - Next 3 forecast periods

## Setup Instructions

### 1. Get Your Free API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account (or log in)
3. Navigate to [API Keys](https://home.openweathermap.org/api_keys)
4. Create a new API key
5. Copy your API key

### 2. Add the API Key to Your Project

#### Option A: Using Environment Variable (Recommended)

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add the following line:
```bash
VITE_OPENWEATHER_API_KEY=your_api_key_here
```
3. Replace `your_api_key_here` with your actual API key
4. Restart your development server

#### Option B: Temporary Development

Edit `src/pages/AddCrop.tsx` and replace:
```typescript
const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "your_api_key_here";
```
with:
```typescript
const WEATHER_API_KEY = "your_actual_api_key";
```

**Note**: Don't commit this to git! Use environment variables instead.

## Free API Tier Limits

- **Requests per day**: 1,000 (free tier)
- **Requests per minute**: 60 (free tier)
- **Update frequency**: Every 3 hours for weather data
- **Coverage**: Worldwide

This is more than sufficient for development and small-scale production.

## How It Works

1. User selects a crop and enters their location
2. System fetches user's location from profile
3. Makes API call to OpenWeatherMap with lat/lon coordinates
4. Receives weather forecast data (7-day forecast)
5. Calculates averages and extracts key metrics
6. AI uses this real weather data in crop recommendations

## Example Weather Data

```typescript
{
  humidity: 78,
  rainfall: 45.5,
  tempMin: 15,
  tempMax: 28,
  currentTemp: 22,
  windSpeed: 5.2,
  description: "Partly cloudy",
  forecast: [
    { date: "2024-01-15 12:00:00", temp: 22, humidity: 75, condition: "Clear" },
    { date: "2024-01-15 15:00:00", temp: 24, humidity: 72, condition: "Clouds" },
    ...
  ]
}
```

## Fallback Behavior

If the weather API fails or returns an error:
- System automatically falls back to default weather data
- User still receives recommendations (though less accurate)
- Error is logged to console for debugging
- No user-facing error message

Default fallback values:
- Humidity: 70%
- Rainfall: 30mm
- Temperature: 15-25°C

## Testing

1. Make sure your API key is set up
2. Add a crop with a location that has location data
3. Click "Get Recommendation"
4. Check the browser console - you should see weather data fetching
5. The recommendation will include current weather conditions

## API Usage in Code

The weather function fetches data from:
```typescript
https://api.openweathermap.org/data/2.5/forecast
```

This endpoint provides:
- Current weather
- 3-hour forecast for 5 days (120 data points)
- All weather parameters

We use the first 7 forecast periods (21 hours) for short-term recommendations.

## Troubleshooting

### "Weather API request failed"
- Check that your API key is correct
- Verify you're under the rate limit (60 requests/minute)
- Check network connection
- API key might need time to activate (up to 2 hours)

### API key not working
- Make sure there are no extra spaces
- Check that you're using the correct API key (different for each environment)
- Some API keys take time to activate after creation

### Development vs Production
- In development: Use environment variable in `.env`
- In production: Set environment variable in hosting platform (Vercel, Netlify, etc.)

## Next Steps

Consider integrating:
- **Soil API** - For real soil data instead of mock data
- **Historical weather** - Compare against seasonal averages
- **Weather alerts** - Notify users of adverse weather conditions
- **Crop-specific weather warnings** - Tailored alerts based on crop type

## Security Note

**Never commit API keys to version control!**

Always use environment variables or a secrets management service.

