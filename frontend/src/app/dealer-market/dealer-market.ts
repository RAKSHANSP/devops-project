import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Dealer {
  _id: string;
  name: string;
  mobile: string;
  location: string;
  address: string;
  productsOffered: string[];
  rating: number;
  postedBy: { name: string };
  postedDate: Date;
}

interface Market {
  _id: string;
  name: string;
  location: string;
  type: string;
  timings: string;
  contact: string;
  commodities: string[];
  rating: number;
  postedDate: Date;
}

@Component({
  selector: 'app-dealer-market',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dealer-market.html',
  styleUrls: ['./dealer-market.css']
})
export class DealerMarket {
  location: string = '';
  dealers: Dealer[] = [];
  markets: Market[] = [];
  errorMessage: string = '';
  loading = false; // Add loading state
  searched = false; // Flag to indicate search has been performed
  private searchTimeout: any; // For debouncing

  constructor(private http: HttpClient) {}

  // Handle typing with debounce
  onLocationChange() {
    this.errorMessage = ''; // Clear error on typing
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      if (this.location.trim()) {
        this.performSearch();
      } else {
        this.dealers = [];
        this.markets = [];
        this.searched = false;
      }
    }, 500); // 500ms debounce delay
  }

  searchLocation() {
    if (!this.location.trim()) {
      this.errorMessage = 'Please enter a location';
      return;
    }
    this.performSearch();
  }

  private performSearch() {
    if (!this.location.trim()) return;

    this.loading = true;
    this.searched = true;
    this.errorMessage = '';

    // Fetch dealers
    this.http.get<Dealer[]>(`http://localhost:5000/dealers?location=${encodeURIComponent(this.location.trim())}`)
      .subscribe({
        next: (data) => {
          this.dealers = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Error fetching dealers: ' + (err.error?.message || 'Unknown error');
          this.dealers = [];
          this.loading = false;
        }
      });

    // Fetch markets
    this.http.get<Market[]>(`http://localhost:5000/markets?location=${encodeURIComponent(this.location.trim())}`)
      .subscribe({
        next: (data) => {
          this.markets = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Error fetching markets: ' + (err.error?.message || 'Unknown error');
          this.markets = [];
          this.loading = false;
        }
      });
  }
}