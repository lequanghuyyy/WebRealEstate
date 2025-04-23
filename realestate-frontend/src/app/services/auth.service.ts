import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Define registration data interface
interface RegistrationData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  status: string;
  phoneNumber?: string;
  licenseNumber?: string | null;
  agencyName?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // Replace with your actual API endpoint
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(private http: HttpClient) { }

  register(email: string, password: string): Observable<any> {
    // For demo purposes, simulate registration success
    // In a real app, replace with actual API call:
    // return this.http.post(`${this.apiUrl}/register`, { email, password });
    
    if (email === 'test@example.com') {
      return throwError(() => ({ status: 409, error: 'Email already exists' }));
    }
    
    return of({ success: true, message: 'Registration successful' }).pipe(
      tap(response => console.log('Registration successful:', response))
    );
  }

  // New method to register users with role selection
  registerWithRole(data: RegistrationData): Observable<any> {
    // For demo purposes, simulate registration with role
    // In a real app, replace with actual API call:
    // return this.http.post(`${this.apiUrl}/register`, data);
    
    if (data.email === 'test@example.com') {
      return throwError(() => ({ status: 409, error: 'Email already exists' }));
    }
    
    // Simulate email verification for agents
    if (data.role === 'agent') {
      // In a real app, this would trigger an email verification
      console.log('Agent registration - email verification required:', data);
      return of({ 
        success: true, 
        requiresVerification: true,
        message: 'Registration successful. Please verify your email and wait for admin approval.'
      });
    }
    
    console.log('User registration successful:', data);
    return of({ 
      success: true, 
      message: 'Registration successful' 
    });
  }

  // Method to verify email (for agent registration)
  verifyEmail(token: string): Observable<any> {
    // For demo purposes, simulate verification
    // In a real app, replace with:
    // return this.http.post(`${this.apiUrl}/verify-email`, { token });
    
    return of({ 
      success: true, 
      message: 'Email verification successful. Your account is pending admin approval.' 
    });
  }

  login(email: string, password: string): Observable<any> {
    // For demo purposes, simulate login success
    // In a real app, replace with actual API call:
    // return this.http.post(`${this.apiUrl}/login`, { email, password });
    
    // Admin credentials
    if (email === 'admin' && password === '123') {
      const mockResponse = {
        token: 'admin-jwt-token',
        user: {
          id: 0,
          email: email,
          name: 'System Administrator',
          role: 'admin',
          phone: '999-888-7777',
          bio: 'System administrator with full access rights',
          createdAt: '2022-01-01'
        }
      };
      
      this.setAuthData(mockResponse);
      return of(mockResponse);
    }
    
    // Regular user credentials
    if (email === 'user1' && password === '123') {
      const mockResponse = {
        token: 'user1-jwt-token',
        user: {
          id: 1,
          email: email,
          name: 'Demo User',
          role: 'user',
          phone: '123-456-7890',
          bio: 'This is a demo user account for testing purposes.',
          createdAt: '2023-01-15'
        }
      };
      
      this.setAuthData(mockResponse);
      return of(mockResponse);
    }

    // Agent credentials
    if (email === 'user2' && password === '123') {
      const mockResponse = {
        token: 'user2-jwt-token',
        user: {
          id: 2,
          email: email,
          name: 'Agent Demo',
          role: 'agent',
          phone: '098-765-4321',
          bio: 'Professional real estate agent with 5 years of experience.',
          agentInfo: {
            licenseNumber: 'AG12345678',
            agency: 'RealEstatePro Agency',
            averageRating: 4.8,
            listings: 24,
            sales: 45
          },
          createdAt: '2022-08-10'
        }
      };
      
      this.setAuthData(mockResponse);
      return of(mockResponse);
    }
    
    // Keep the original test user
    if (email === 'test@example.com' && password === 'Password123') {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 3,
          email: email,
          name: 'Test User',
          role: 'user'
        }
      };
      
      this.setAuthData(mockResponse);
      return of(mockResponse);
    }
    
    return throwError(() => ({ status: 401, error: 'Invalid credentials' }));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  isAgent(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'agent';
  }
  
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  private setAuthData(data: any): void {
    localStorage.setItem(this.tokenKey, data.token);
    localStorage.setItem(this.userKey, JSON.stringify(data.user));
  }

  requestPasswordReset(email: string): Observable<any> {
    // In a real app, replace with actual API call
    return of({ success: true, message: 'Password reset email sent' });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    // In a real app, replace with actual API call
    return of({ success: true, message: 'Password reset successful' });
  }
} 