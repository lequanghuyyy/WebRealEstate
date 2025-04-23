import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Login form data
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };
  
  // UI state
  isLoading = false;
  errorMessage: string | null = null;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    // If user is already logged in, redirect based on role
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
    
    // Pre-fill the admin credentials for demo purposes
    this.loginData.email = 'admin';
    this.loginData.password = '123';
  }
  
  onSignIn() {
    this.errorMessage = null;
    this.isLoading = true;
    
    // Basic validation
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Email and password are required';
      this.isLoading = false;
      return;
    }
    
    this.authService.login(this.loginData.email, this.loginData.password)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.isLoading = false;
          this.redirectBasedOnRole();
        },
        error: (err) => {
          console.error('Login error:', err);
          this.isLoading = false;
          this.errorMessage = 'Invalid credentials. Please check your email and password.';
        }
      });
  }
  
  // Helper method to redirect based on user role
  private redirectBasedOnRole() {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else if (this.authService.isAgent()) {
      this.router.navigate(['/agent/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
  
  loginWithGoogle() {
    // In a real app, implement OAuth flow
    console.log('Google login clicked');
  }
  
  loginWithFacebook() {
    // In a real app, implement OAuth flow
    console.log('Facebook login clicked');
  }
} 