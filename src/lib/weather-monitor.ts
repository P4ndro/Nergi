/**
 * Weather Monitoring Service
 * Detects unexpected weather changes and triggers notifications
 */

import { fetchWeatherData, WeatherData } from "./weather-api";
import { toast } from "sonner";

export interface WeatherAlert {
  type: 'frost' | 'heat' | 'rain' | 'storm' | 'drought' | 'humidity';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  message: string;
  action: string;
  date: Date;
}

let lastWeatherData: WeatherData | null = null;
let monitoringInterval: NodeJS.Timeout | null = null;

export class WeatherMonitor {
  private static instance: WeatherMonitor;
  private alerts: WeatherAlert[] = [];
  private subscribers: Array<(alerts: WeatherAlert[]) => void> = [];

  static getInstance() {
    if (!WeatherMonitor.instance) {
      WeatherMonitor.instance = new WeatherMonitor();
    }
    return WeatherMonitor.instance;
  }

  startMonitoring(lat: number, lon: number, intervalMinutes: number = 30) {
    if (monitoringInterval) {
      this.stopMonitoring();
    }

    // Initial check
    this.checkWeatherChanges(lat, lon);

    // Check periodically
    monitoringInterval = setInterval(() => {
      this.checkWeatherChanges(lat, lon);
    }, intervalMinutes * 60 * 1000);
  }

  stopMonitoring() {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  }

  subscribe(callback: (alerts: WeatherAlert[]) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.alerts));
  }

  private async checkWeatherChanges(lat: number, lon: number) {
    try {
      const currentWeather = await fetchWeatherData(lat, lon);
      if (!currentWeather) return;

      const newAlerts: WeatherAlert[] = [];

      // Detect unexpected weather changes
      if (lastWeatherData) {
        newAlerts.push(...this.detectChanges(lastWeatherData, currentWeather));
      }

      // Check for critical conditions
      newAlerts.push(...this.checkCriticalConditions(currentWeather));

      // Update last known state
      lastWeatherData = currentWeather;

      // Add to alerts list
      this.alerts = [...this.alerts, ...newAlerts];

      // Notify subscribers
      if (newAlerts.length > 0) {
        this.notifySubscribers();
        this.showNotifications(newAlerts);
      }
    } catch (error) {
      console.error('Weather monitoring error:', error);
    }
  }

  private detectChanges(previous: WeatherData, current: WeatherData): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];
    const tempChange = current.currentTemp - previous.currentTemp;
    const rainChange = current.rainfall - previous.rainfall;

    // Sudden temperature drop (frost warning)
    if (tempChange < -10 && current.tempMin < 5) {
      alerts.push({
        type: 'frost',
        severity: 'critical',
        message: `Temperature dropped ${Math.abs(tempChange)}°C. Freezing conditions expected!`,
        action: 'Protect sensitive crops immediately',
        date: new Date()
      });
    }

    // Sudden temperature rise (heat stress)
    if (tempChange > 10 && current.tempMax > 35) {
      alerts.push({
        type: 'heat',
        severity: 'high',
        message: `Temperature rose ${tempChange}°C. Extreme heat expected!`,
        action: 'Increase irrigation and provide shade',
        date: new Date()
      });
    }

    // Heavy unexpected rainfall
    if (rainChange > 50 && current.rainfall > 100) {
      alerts.push({
        type: 'rain',
        severity: 'high',
        message: `Heavy unexpected rainfall: ${current.rainfall}mm detected!`,
        action: 'Check drainage and protect against flooding and fungal diseases',
        date: new Date()
      });
    }

    return alerts;
  }

  private checkCriticalConditions(weather: WeatherData): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];

    // Frost warning
    if (weather.tempMin < 0) {
      alerts.push({
        type: 'frost',
        severity: 'critical',
        message: `Freezing temperatures expected: ${weather.tempMin}°C`,
        action: 'Cover sensitive crops or move to shelter',
        date: new Date()
      });
    }

    // Extreme heat
    if (weather.tempMax > 40) {
      alerts.push({
        type: 'heat',
        severity: 'high',
        message: `Extreme heat warning: ${weather.tempMax}°C`,
        action: 'Water plants early morning/late evening, provide shade',
        date: new Date()
      });
    }

    // High humidity (fungal risk)
    if (weather.humidity > 90) {
      alerts.push({
        type: 'humidity',
        severity: 'moderate',
        message: `Very high humidity: ${weather.humidity}% - fungal disease risk`,
        action: 'Improve air circulation, consider fungicide application',
        date: new Date()
      });
    }

    // Heavy rainfall
    if (weather.rainfall > 100) {
      alerts.push({
        type: 'rain',
        severity: 'high',
        message: `Heavy rainfall expected: ${weather.rainfall}mm`,
        action: 'Check drainage, protect against flooding',
        date: new Date()
      });
    }

    // Drought conditions
    if (weather.rainfall < 5 && weather.humidity < 30) {
      alerts.push({
        type: 'drought',
        severity: 'moderate',
        message: 'Dry conditions detected - low rainfall and humidity',
        action: 'Increase irrigation frequency, apply mulch to retain moisture',
        date: new Date()
      });
    }

    // Strong winds
    if (weather.windSpeed > 15) {
      alerts.push({
        type: 'storm',
        severity: 'high',
        message: `Strong winds: ${weather.windSpeed.toFixed(1)} m/s`,
        action: 'Secure greenhouse structures, protect vulnerable plants',
        date: new Date()
      });
    }

    return alerts;
  }

  private showNotifications(alerts: WeatherAlert[]) {
    alerts.forEach(alert => {
      if (alert.severity === 'critical' || alert.severity === 'high') {
        toast.warning(alert.message, {
          description: alert.action,
          duration: 8000,
        });
      } else {
        toast.info(alert.message, {
          description: alert.action,
          duration: 5000,
        });
      }
    });
  }

  getAlerts() {
    return this.alerts;
  }

  clearAlerts() {
    this.alerts = [];
    this.notifySubscribers();
  }
}

