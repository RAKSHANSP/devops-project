import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  credentials = { email: '', password: '' };
  message: string | null = null; // Added to store the success message

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.auth.login(this.credentials).subscribe({
      next: (res) => {
        // Optional: save token
        if (res.token) localStorage.setItem('token', res.token);
        this.message = 'Login Successful'; // Set the success message

        // Navigate to dashboard after a brief delay to show the message
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500); // Delay of 1.5 seconds to display the message
      },
      error: (err) => {
        this.message = err.error?.message || 'Invalid credentials. Please try again.'; // Set error message
      }
    });
  }
}