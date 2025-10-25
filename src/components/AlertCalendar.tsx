import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Beaker, 
  Droplets, 
  Wind, 
  CloudRain, 
  Snowflake,
  Sun,
  Cloud
} from "lucide-react";
import { format, isToday, isBefore, addDays } from "date-fns";
import { fetchWeatherData, WeatherData } from "@/lib/weather-api";
import { WeatherMonitor } from "@/lib/weather-monitor";
import { supabase } from "@/integrations/supabase/client";

interface AlertCalendarProps {
  userId: string;
}

interface CalendarAlert {
  date: Date;
  type: "medicine" | "weather" | "task";
  severity: "low" | "moderate" | "high" | "critical";
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const AlertCalendar = ({ userId }: AlertCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [alerts, setAlerts] = useState<CalendarAlert[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherChangeDetected, setWeatherChangeDetected] = useState(false);

  useEffect(() => {
    loadWeatherAndAlerts();
    
    // Subscribe to weather alerts
    const monitor = WeatherMonitor.getInstance();
    const unsubscribe = monitor.subscribe((alerts) => {
      // Update alerts when weather monitor detects changes
      setAlerts(prev => [...prev, ...alerts.map(alert => ({
        date: alert.date,
        type: "weather" as const,
        severity: alert.severity,
        title: `Weather: ${alert.type}`,
        description: `${alert.message} - ${alert.action}`,
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />
      }))]);
    });

    return () => unsubscribe();
  }, [userId, currentDate]);

  const loadWeatherAndAlerts = async () => {
    try {
      // Get user location
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('location_lat, location_lon')
        .eq('id', userId)
        .single();

      if (profile?.location_lat && profile?.location_lon) {
        const weather = await fetchWeatherData(profile.location_lat, profile.location_lon);
        if (weather) {
          setWeatherData(weather);
          detectWeatherChanges(weather);

          // Start monitoring for unexpected weather changes
          const monitor = WeatherMonitor.getInstance();
          monitor.startMonitoring(profile.location_lat, profile.location_lon, 30);
        }
      } else {
        // Fallback to Tbilisi
        const weather = await fetchWeatherData(41.7151, 44.8271);
        if (weather) {
          setWeatherData(weather);
          detectWeatherChanges(weather);
        }
      }
    } catch (error) {
      console.error("Error loading weather:", error);
    }

    // Load medicine application dates from user crops
    loadMedicineAlerts();
  };

  const detectWeatherChanges = (newWeather: WeatherData) => {
    // Check for unexpected weather changes
    if (newWeather.rainfall > 50) {
      setWeatherChangeDetected(true);
      setAlerts(prev => [...prev, {
        date: new Date(),
        type: "weather",
        severity: "high",
        title: "Heavy Rainfall Expected",
        description: `${newWeather.rainfall}mm of rain expected. Take precautions for fungal diseases.`,
        icon: <CloudRain className="w-4 h-4 text-blue-500" />
      }]);
    }

    if (newWeather.tempMin < 0) {
      setWeatherChangeDetected(true);
      setAlerts(prev => [...prev, {
        date: new Date(),
        type: "weather",
        severity: "high",
        title: "Frost Warning",
        description: `Freezing temperatures (${newWeather.tempMin}°C) expected. Protect sensitive crops.`,
        icon: <Snowflake className="w-4 h-4 text-blue-400" />
      }]);
    }

    if (newWeather.humidity > 85) {
      setAlerts(prev => [...prev, {
        date: new Date(),
        type: "weather",
        severity: "moderate",
        title: "High Humidity Alert",
        description: `${newWeather.humidity}% humidity increases fungal disease risk. Improve air circulation.`,
        icon: <Droplets className="w-4 h-4 text-blue-500" />
      }]);
    }

    if (newWeather.windSpeed > 15) {
      setAlerts(prev => [...prev, {
        date: new Date(),
        type: "weather",
        severity: "moderate",
        title: "Strong Winds",
        description: `Wind speeds up to ${newWeather.windSpeed} m/s. Secure greenhouse structures.`,
        icon: <Wind className="w-4 h-4 text-gray-500" />
      }]);
    }
  };

  const loadMedicineAlerts = () => {
    // This would fetch from user crops
    // For now, add sample medicine alerts
    const medicineDate = addDays(new Date(), 7); // Example: 7 days from now
    setAlerts(prev => [...prev, {
      date: medicineDate,
      type: "medicine",
      severity: "high",
      title: "Pesticide Application Due",
      description: "Time to apply preventive pesticide to protect crops from pests",
      icon: <Beaker className="w-4 h-4 text-green-600" />
    }]);
  };

  const getDateModifiers = () => {
    const modifiers: any = {};
    const modifiersClassNames: any = {};

    alerts.forEach(alert => {
      const dateStr = format(alert.date, 'yyyy-MM-dd');
      if (!modifiers[alert.type]) {
        modifiers[alert.type] = [];
      }
      modifiers[alert.type].push(alert.date);

      if (!modifiersClassNames[alert.type]) {
        modifiersClassNames[alert.type] = "";
      }

      if (alert.type === "medicine") {
        modifiersClassNames.medicine = "bg-green-500 text-white hover:bg-green-600";
      } else if (alert.type === "weather" && alert.severity === "high") {
        modifiersClassNames.weatherHigh = "bg-red-500 text-white hover:bg-red-600";
      } else if (alert.type === "weather") {
        modifiersClassNames.weatherModerate = "bg-orange-500 text-white hover:bg-orange-600";
      }
    });

    return { modifiers, modifiersClassNames };
  };

  const getTodayAlerts = () => {
    return alerts.filter(alert => 
      isToday(alert.date) || (isBefore(alert.date, addDays(new Date(), 3)) && !isBefore(alert.date, new Date()))
    );
  };

  const { modifiers, modifiersClassNames } = getDateModifiers();
  const todayAlerts = getTodayAlerts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Crop Calendar & Alerts
        </CardTitle>
        <CardDescription>
          View your crop schedule and weather alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Medicine Application</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Urgent Weather Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span>Weather Advisory</span>
          </div>
        </div>

        {/* Calendar */}
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => date && setCurrentDate(date)}
          className="rounded-md border"
          modifiers={modifiers}
          modifiersClassNames={modifiersClassNames}
        />

        {/* Today's Alerts */}
        {todayAlerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Upcoming Alerts (Next 3 Days)</h3>
            {todayAlerts.map((alert, idx) => (
              <Alert 
                key={idx}
                className={
                  alert.severity === "high" || alert.severity === "critical"
                    ? "border-red-500 bg-red-500/10" 
                    : alert.severity === "moderate"
                    ? "border-orange-500 bg-orange-500/10"
                    : ""
                }
              >
                <div className="flex items-start gap-2">
                  {alert.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(alert.date, "MMM d, yyyy")} - {alert.description}
                    </p>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Weather Summary */}
        {weatherData && (
          <Alert className="border-blue-500 bg-blue-500/10">
            <Sun className="w-4 h-4 text-blue-500" />
            <AlertDescription>
              <p className="font-semibold mb-1">Current Weather Conditions</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p>Temp: {weatherData.tempMin}-{weatherData.tempMax}°C</p>
                <p>Humidity: {weatherData.humidity}%</p>
                <p>Rainfall: {weatherData.rainfall}mm</p>
                <p>Wind: {weatherData.windSpeed.toFixed(1)} m/s</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

