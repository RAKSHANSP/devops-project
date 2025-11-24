import { Weather } from './weather';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

describe('Weather Component (White-box)', () => {
  let component: Weather;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Weather]
    });
    component = TestBed.inject(Weather);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('getIrrigationNeed', () => {
    it('should return "No irrigation needed" for high rain chance', () => {
      expect(component.getIrrigationNeed(60, 70)).toBe('No irrigation needed (high rain chance)');
    });

    it('should return "Irrigation recommended" for low humidity', () => {
      expect(component.getIrrigationNeed(30, 20)).toBe('Irrigation recommended (low humidity)');
    });

    it('should return "Monitor soil moisture" otherwise', () => {
      expect(component.getIrrigationNeed(50, 30)).toBe('Monitor soil moisture');
    });
  });

  describe('getPlantingSuitability', () => {
    it('should return Suitable for planting for good range', () => {
      expect(component.getPlantingSuitability(20, 25)).toBe('Suitable for planting');
    });

    it('should return Unsuitable for extreme temperatures', () => {
      expect(component.getPlantingSuitability(5, 38)).toBe('Unsuitable (extreme temperatures)');
    });

    it('should return Caution for mid-range', () => {
      expect(component.getPlantingSuitability(12, 32)).toBe('Caution: Check crop tolerance');
    });
  });

  describe('getPestRisk', () => {
    it('should return High pest risk when humidity>70 & temp>25', () => {
      expect(component.getPestRisk(80, 30)).toBe('High pest risk');
    });

    it('should return Moderate pest risk when humidity>50 & temp>20', () => {
      expect(component.getPestRisk(60, 22)).toBe('Moderate pest risk');
    });

    it('should return Low pest risk otherwise', () => {
      expect(component.getPestRisk(30, 15)).toBe('Low pest risk');
    });
  });

  describe('processForecast', () => {
    it('should aggregate and process forecast data correctly', () => {
      const mockList = [
        { dt_txt: '2025-10-16 09:00:00', main: { temp_min: 20, temp_max: 30, humidity: 60 }, pop: 0.3, wind: { speed: 10 }, weather: [{ description: 'clear' }] },
        { dt_txt: '2025-10-16 12:00:00', main: { temp_min: 22, temp_max: 32, humidity: 65 }, pop: 0.4, wind: { speed: 12 }, weather: [{ description: 'clear' }] }
      ];
      component.processForecast(mockList);
      expect(component.forecastData.length).toBeGreaterThan(0);
      expect(component.forecastData[0].date).toBeTruthy();
      expect(component.forecastData[0].description).toBe('clear');
    });
  });
});
