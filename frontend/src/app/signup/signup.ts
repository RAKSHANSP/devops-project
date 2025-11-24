import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  user = { name: '', role: '', email: '', password: '' };
  message: string = '';
  isSuccess: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    // Stricter email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com|icloud\.com)$/i;
    if (!emailRegex.test(this.user.email)) {
      this.isSuccess = false;
      this.message = 'Please enter a valid email address (e.g., test@gmail.com, test@yahoo.com).';
      return;
    }

    this.auth.signup(this.user).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = 'Signup successful! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isSuccess = false;
        this.message = err.error?.message || 'Signup failed. Please try again.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}