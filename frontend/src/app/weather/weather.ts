import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DailyForecast {
  tempMin: number;
  tempMax: number;
  humidity: number;
  precipProb: number;
  windSpeed: number;
  description: string;
  count: number;
}

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.html', // Note: Changed to .html to match your file extension
  styleUrls: ['./weather.css']
})
export class Weather {
  city: string = 'Delhi'; // Default city
  weatherData: any;
  forecastData: { date: string; tempMin: string; tempMax: string; humidity: string; precipProb: string; windSpeed: string; description: string; irrigationNeed: string; plantingSuitability: string; pestRisk: string }[] = [];
  errorMessage: string = '';

  apiKey = '9052214015c9a12932150a59317a7b25'; // Your OpenWeatherMap API key

  constructor(private http: HttpClient) {
    this.getWeather(); // Load default city weather on init
    this.getForecast(); // Load 5-day forecast on init
  }

  getWeather() {
    if (!this.city) {
      this.errorMessage = 'Please enter a city name';
      this.weatherData = null;
      return;
    }

    this.errorMessage = '';
    this.http.get(`https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${this.apiKey}&units=metric`)
      .subscribe({
        next: (data) => this.weatherData = data,
        error: (err) => {
          this.weatherData = null;
          this.errorMessage = err.status === 404 ? 'City not found' : 'Error fetching weather data';
        }
      });
  }

  getForecast() {
    if (!this.city) {
      this.errorMessage = 'Please enter a city name';
      this.forecastData = [];
      return;
    }

    this.errorMessage = '';
    this.http.get(`https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=${this.apiKey}&units=metric`)
      .subscribe({
        next: (data: any) => {
          this.processForecast(data.list);
          this.errorMessage = '';
        },
        error: (err) => {
          this.forecastData = [];
          this.errorMessage = err.status === 404 ? 'City not found' : 'Error fetching forecast data';
        }
      });
  }

  processForecast(list: any[]) {
    const dailyForecasts: { [key: string]: DailyForecast } = {};
    list.forEach(item => {
      const date = new Date(item.dt_txt).toLocaleDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          humidity: item.main.humidity,
          precipProb: item.pop * 100 || 0,
          windSpeed: item.wind.speed,
          description: item.weather[0].description,
          count: 1
        };
      } else {
        dailyForecasts[date].tempMin = Math.min(dailyForecasts[date].tempMin, item.main.temp_min);
        dailyForecasts[date].tempMax = Math.max(dailyForecasts[date].tempMax, item.main.temp_max);
        dailyForecasts[date].humidity += item.main.humidity;
        dailyForecasts[date].precipProb = Math.max(dailyForecasts[date].precipProb, item.pop * 100 || 0);
        dailyForecasts[date].windSpeed += item.wind.speed;
        dailyForecasts[date].count++;
      }
    });

    this.forecastData = Object.entries(dailyForecasts)
      .slice(0, 5)
      .map(([date, data]: [string, DailyForecast]) => {
        const avgHumidity = data.humidity / data.count;
        const avgWindSpeed = data.windSpeed / data.count;
        return {
          date,
          tempMin: data.tempMin.toFixed(1),
          tempMax: data.tempMax.toFixed(1),
          humidity: avgHumidity.toFixed(1),
          precipProb: data.precipProb.toFixed(1),
          windSpeed: avgWindSpeed.toFixed(1),
          description: data.description,
          irrigationNeed: this.getIrrigationNeed(avgHumidity, data.precipProb),
          plantingSuitability: this.getPlantingSuitability(data.tempMin, data.tempMax),
          pestRisk: this.getPestRisk(avgHumidity, data.tempMax)
        };
      });
  }

  getIrrigationNeed(humidity: number, precipProb: number): string {
    if (precipProb > 50) return 'No irrigation needed (high rain chance)';
    if (humidity < 40) return 'Irrigation recommended (low humidity)';
    return 'Monitor soil moisture';
  }

  getPlantingSuitability(tempMin: number, tempMax: number): string {
    if (tempMin >= 15 && tempMax <= 30) return 'Suitable for planting';
    if (tempMin < 10 || tempMax > 35) return 'Unsuitable (extreme temperatures)';
    return 'Caution: Check crop tolerance';
  }

  getPestRisk(humidity: number, tempMax: number): string {
    if (humidity > 70 && tempMax > 25) return 'High pest risk';
    if (humidity > 50 && tempMax > 20) return 'Moderate pest risk';
    return 'Low pest risk';
  }
}