import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard{
  isScreenSmall: boolean = false;
  userRole: string | null = 'Farmer'; // Placeholder; replace with auth service data

  constructor(private router: Router) {
    this.checkScreenSize();
    // Fetch user role from AuthService or localStorage on init
    // Example: this.userRole = this.authService.getUserRole();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isScreenSmall = window.innerWidth < 600;
  }

  goToWeather() {
    this.router.navigate(['/weather']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  goToGroupChat() {
    this.router.navigate(['/group-chat']);
  }

  goToIndividualChat() {
    this.router.navigate(['/individual-chat']);
  }

  goToGovtOfficial() {
    this.router.navigate(['/govt-official']);
  }

  goToDealerMarket() {
    this.router.navigate(['/dealer-market']);
  }

  goToInformationSharing() {
    this.router.navigate(['/information-sharing']);
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}