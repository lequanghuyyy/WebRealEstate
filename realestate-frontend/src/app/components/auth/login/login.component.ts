import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, of } from 'rxjs';

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
    username: '',
    password: '',
    rememberMe: false
  };
  
  // UI state
  isLoading = false;
  errorMessage: string | null = null;
  debugInfo: string | null = null;
  registrationSuccess = false;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.registrationSuccess = true;
      }
    });
    
    // If user is already logged in, redirect based on role
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
    
    this.authService.checkServiceHealth();
  }
  
  onSignIn() {
    this.errorMessage = null;
    this.debugInfo = null;
    this.isLoading = true;
    
    console.log('Login attempt with username:', this.loginData.username);
    
    // Basic validation
    if (!this.loginData.username || !this.loginData.password) {
      this.errorMessage = 'Username and password are required';
      this.isLoading = false;
      return;
    }
    
    // Add a slight delay to ensure UI feedback
    setTimeout(() => {
      console.log('Sending login request to AuthService');
      this.authService.login(this.loginData.username, this.loginData.password)
        .subscribe({
          next: (response) => {
            console.log('Login successful, response received:', response);
            
            // Token is already saved in the AuthService login method
            const token = response.token;
            if (token) {
              console.log('Token received, extracting roles');
              // Extract roles directly from the token
              const roles = this.authService.getRolesFromToken(token);
              console.log('Roles extracted from token:', roles);
              
              if (roles && roles.length > 0) {
                this.isLoading = false;
                console.log('Redirecting based on roles from token');
                this.redirectByRoles(roles);
              } else {
                // Fallback to fetching user if roles weren't in the token
                console.log('No roles in token, fetching user data');
                this.authService.fetchCurrentUser().subscribe({
                  next: (user) => {
                    console.log('User data fetched successfully:', user);
                    this.isLoading = false;
                    this.redirectBasedOnRole();
                  },
                  error: (err) => {
                    console.error('Error fetching user data:', err);
                    this.isLoading = false;
                    // Vẫn chuyển hướng kể cả khi không lấy được thông tin user chi tiết
                    this.router.navigate(['/']);
                  }
                });
              }
            } else {
              // Trường hợp không có token, chuyển về trang chủ
              console.warn('No token in response, redirecting to home page');
              this.isLoading = false;
              this.router.navigate(['/']);
            }
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Login error:', err);
            
            // Special handling for pending agent approval error
            if (err.message && err.message.includes('pending approval')) {
              this.errorMessage = 'Your agent account is pending approval by an administrator. Please check back later.';
              return;
            }
            
            // More detailed error handling
            if (err.status === 0) {
              this.errorMessage = 'Cannot connect to the server. Please ensure the backend is running and check CORS settings.';
            } else if (err.status === 401) {
              this.errorMessage = err.error?.message || err.error?.description || 'Invalid username or password.';
            } else if (err.status === 403) {
              this.errorMessage = 'Access forbidden. Your account may be locked or disabled.';
            } else if (err.status === 404) {
              this.errorMessage = 'Login service not found. Please check API endpoint configuration.';
            } else {
              this.errorMessage = err.error?.message || err.error?.description || 'Login failed. Please try again later.';
            }
            
            // Add additional debug info on screen during testing
            if (!environment.production) {
              this.debugInfo = `Status: ${err.status}, Error: ${JSON.stringify(err.error || {})}, 
              Backend may not be running or proxy configuration issue.`;
            }
          }
        });
    }, 500);
  }
  
  // New method to redirect based on roles from token
  private redirectByRoles(roles: string[]) {
    this.isLoading = false;
    console.log('Redirecting with roles:', roles);
    
    try {
      const currentUser = this.authService.getCurrentUser();
      
      // Nếu là agent và đang chờ xét duyệt, không cho phép vào trang agent
      if (roles.includes('AGENT') && 
          currentUser && 
          currentUser.status === 'PENDING_APPROVAL') {
        console.log('Agent account pending approval, displaying error message');
        this.errorMessage = 'Your agent account is pending approval by an administrator. Please check back later.';
        this.authService.logout(); // Logout để tránh cache trạng thái đăng nhập
        return;
      }
      
      if (roles.includes('ADMIN')) {
        console.log('User has ADMIN role, redirecting to admin dashboard');
        this.router.navigate(['/admin/dashboard']);
      } else if (roles.includes('AGENT')) {
        console.log('User has AGENT role, redirecting to agent dashboard');
        this.router.navigate(['/agent/dashboard']);
      } else if (roles.includes('BUYER') || roles.includes('RENTER') || roles.includes('USER')) {
        console.log('User has BUYER/RENTER/USER role, redirecting to home page');
        this.router.navigate(['/']);
      } else {
        console.log('No specific role found, redirecting to home page as default');
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error during role-based redirection:', error);
      // Fallback to home page if anything goes wrong
      this.router.navigate(['/']);
    }
  }
  
  // Helper method to redirect based on user role
  private redirectBasedOnRole() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }
    
    const roles = user.roles || [];
    
    // Kiểm tra nếu là agent và đang chờ xét duyệt
    if (roles.includes('AGENT') && user.status === 'PENDING_APPROVAL') {
      console.log('Agent account pending approval, displaying error message');
      this.errorMessage = 'Your agent account is pending approval by an administrator. Please check back later.';
      this.authService.logout(); // Logout để tránh cache trạng thái đăng nhập
      return;
    }
    
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('AGENT')) {
      this.router.navigate(['/agent/dashboard']);
    } else if (roles.includes('BUYER') || roles.includes('RENTER')) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/']);
    }
  }
  
  loginWithGoogle() {
    // In a real app, implement OAuth flow
  }
  
  loginWithFacebook() {
    // In a real app, implement OAuth flow
  }
} 