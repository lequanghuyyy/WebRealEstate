import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthenticationRequest, TokenRequest, JwtDto, UserCreationRequest, UserResponse, BaseResponse, UserUpdateRequest, UserStatus } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';
  private currentUserSubject = new BehaviorSubject<UserResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Initialize current user from localStorage on service creation
    const savedUser = localStorage.getItem(this.userKey);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        this.clearAuthData();
      }
    }
  }

  // Add a diagnostic method to check service connections
  checkServiceHealth(): void {
    // Check Security Service
    this.http.get(`${this.apiUrl}/health`, { responseType: 'text' })
      .pipe(
        catchError(error => {
          return of('Security Service not responding');
        })
      )
      .subscribe(result => {
        // Health check completed
      });
    
    // Check User Experience Service
    this.http.get(`${this.apiUrl}/experience/health`, { responseType: 'text' })
      .pipe(
        catchError(error => {
          return of('User Experience Service not responding');
        })
      )
      .subscribe(result => {
        // Health check completed
      });
  }

  register(userData: UserCreationRequest): Observable<UserResponse> {
    // Connect to the backend signup API
    return this.http.post<any>(`${this.apiUrl}/users/auth/signup`, userData)
      .pipe(
        map(response => {
          // Handle various response formats
          // Case 1: Direct UserResponse object
          if (response && response.id) {
            return response as UserResponse;
          }
          // Case 2: Spring Boot BaseResponse wrapper
          else if (response && response.data) {
            return response.data as UserResponse;
          }
          // Case 3: Other wrapper format
          else if (response && response.user) {
            return response.user as UserResponse;
          }
          // Default fallback
          else {
            return response as UserResponse;
          }
        }),
        catchError(error => {
          // Extract meaningful error message
          let errorMessage = 'Registration failed';
          
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            }
          }
          
          if (error.status === 409) {
            errorMessage = 'Username or email already exists';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Invalid registration data';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Method to register with specific role - kept for backward compatibility
  registerWithRole(userData: any): Observable<any> {
    // Map the frontend data format to the backend UserCreationRequest format
    const userCreationRequest: UserCreationRequest = {
      username: userData.email,
      email: userData.email,
      password: userData.password,
      firstName: userData.fullName.split(' ')[0],
      lastName: userData.fullName.split(' ').slice(1).join(' ') || '',
      phone: userData.phoneNumber || '',
      roles: [userData.role === 'agent' ? 'AGENT' : 'USER']
    };

    return this.register(userCreationRequest).pipe(
      map(response => ({
        success: true,
        message: 'Registration successful',
        requiresVerification: userCreationRequest.roles.includes('AGENT')
      }))
    );
  }

  login(username: string, password: string): Observable<JwtDto> {
    console.log('Login attempt for user:', username);
    console.log('API URL:', this.apiUrl);
    
    // Create login request object
    const loginRequest: AuthenticationRequest = {
      username: username,
      password: password
    };
    
    const loginUrl = `${this.apiUrl}/users/auth/login`;
    console.log('Sending login request to:', loginUrl);
    
    return this.http.post<BaseResponse<JwtDto>>(loginUrl, loginRequest, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .pipe(
        tap(response => {
          console.log('Login response received:', response);
          
          // Extract token from response, handle different response formats
          const token = response.data?.token || 
                      (response as any).token || 
                      (response.data && response.data.token) || 
                      (response as any).access_token || 
                      (response.data && (response.data as any).access_token);
          
          console.log('Token extracted from response:', token ? 'Token found' : 'No token found');
          
          if (token) {
            // Save the token to localStorage
            this.setToken(token);
            console.log('Token saved to localStorage');
            
            // Try to extract user info from token
            const decoded = this.decodeToken(token);
            console.log('Decoded token payload:', decoded);
            
            if (decoded) {
              // Basic user info from token claims
              const userFromToken: Partial<UserResponse> = {
                id: decoded.id || decoded.sub || decoded.user_id || null,
                // Nếu token không có username, dùng trường sub làm fallback
                username: decoded.username || decoded.preferred_username || decoded.name || decoded.email || decoded.sub || 'user_' + (decoded.sub || '').substring(0, 8),
                email: decoded.email || null,
                roles: this.getRolesFromToken(token),
              };
              
              console.log('User info extracted from token:', userFromToken);
              
              // Nếu có ID và roles, coi như đủ thông tin để tiếp tục
              if (userFromToken.id && userFromToken.roles && userFromToken.roles.length > 0) {
                // Store basic info from token and then fetch complete user details from API
                this.storeUser(userFromToken as UserResponse);
                this.currentUserSubject.next(userFromToken as UserResponse);
                console.log('Basic user info stored and emitted');
                
                // Fetch complete user details from API - but don't fail login if this fails
                this.fetchUserById(userFromToken.id).subscribe({
                  next: (user) => {
                    console.log('Complete user details fetched:', user);
                    // Update user with complete details
                    this.storeUser(user);
                    this.currentUserSubject.next(user);
                  },
                  error: (error) => {
                    console.log('Failed to fetch detailed user info, using basic info from token:', error);
                    // Continue with basic info from token - don't fail login
                  }
                });
              } else {
                console.warn('Could not extract required user info from token');
              }
            } else {
              console.warn('Could not decode token');
            }
          } else {
            console.warn('No token found in response');
          }
        }),
        map(response => {
          // Check if response is wrapped in data property (common in Spring Boot)
          if (response.data) {
            return response.data;
          } else {
            return {
              token: (response as any).token || (response as any).access_token || '',
              expiredIn: (response as any).expiredIn || (response as any).expiration || new Date(Date.now() + 86400000)
            };
          }
        }),
        catchError(error => {
          console.error('Login failed:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    const token = this.getToken();
    
    if (token) {
      const tokenRequest: TokenRequest = {
        token: token
      };
      
      // Call backend logout API
      this.http.post<BaseResponse<void>>(`${this.apiUrl}/users/auth/logout`, tokenRequest)
        .pipe(
          catchError(error => {
            return of(null);
          })
        )
        .subscribe(() => {
          // Clear local data regardless of API call success
          this.clearAuthData();
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        });
    } else {
      // Just clear local data if no token exists
      this.clearAuthData();
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  fetchCurrentUser(): Observable<UserResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No authentication token found'));
    }
    return this.http.get<any>(`${this.apiUrl}/me`)
      .pipe(
        map(response => this.extractUserData(response)),
        catchError(error => {
          return this.http.get<any>(`${this.apiUrl}/user`).pipe(
            map(response => this.extractUserData(response)),
            catchError(error2 => {
              // 3. Final attempt with /auth/user endpoint
              return this.http.get<any>(`${this.apiUrl}/auth/user`).pipe(
                map(response => this.extractUserData(response)),
                catchError(error3 => {
                  return throwError(() => new Error('Failed to fetch user profile from all known endpoints'));
                })
              );
            })
          );
        })
      );
  }
  
  /**
   * Helper method to extract user data from various response formats
   */
  private extractUserData(response: any): UserResponse {
    // Case 1: Direct user data object
    if (response.username || response.id) {
      const userData = response as UserResponse;
      this.storeUser(userData);
      this.currentUserSubject.next(userData);
      return userData;
    }
    // Case 2: Wrapped in data property
    else if (response.data && (response.data.username || response.data.id)) {
      const userData = response.data as UserResponse;
      this.storeUser(userData);
      this.currentUserSubject.next(userData);
      return userData;
    }
    // Case 3: Wrapped in user property
    else if (response.user && (response.user.username || response.user.id)) {
      const userData = response.user as UserResponse;
      this.storeUser(userData);
      this.currentUserSubject.next(userData);
      return userData;
    }
    // Error case
    else {
      throw new Error('Invalid user data format in response');
    }
  }

  updateUserProfile(userData: UserUpdateRequest): Observable<UserResponse> {
    return this.http.put<BaseResponse<UserResponse>>(`${this.apiUrl}/update`, userData)
      .pipe(
        map(response => response.data),
        tap(user => {
          this.storeUser(user);
          this.currentUserSubject.next(user);
        }),
        catchError(error => throwError(() => new Error(error.error?.message || 'Failed to update profile')))
      );
  }

  // Method to check user roles
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    
    // Handle case where roles is not an array but a single string
    if (typeof user.roles === 'string') {
      const roleStr = String(user.roles).toUpperCase();
      return roleStr === 'ADMIN' || roleStr === 'ROLE_ADMIN';
    }
    
    // Handle case where roles might not be defined
    if (!user.roles) {
      return false;
    }
    
    // If roles is an array (most common case)
    if (Array.isArray(user.roles)) {
      // Directly check for 'ADMIN' role as it appears in the received data
      if (user.roles.includes('ADMIN')) {
        return true;
      }
      
      // Normalized check for different case formats
      const normalizedRoles = user.roles.map(role => {
        if (typeof role === 'string') {
          return role.toUpperCase();
        }
        return '';
      });
      
      // Check all possible admin role variations
      return normalizedRoles.some(r => 
        r === 'ADMIN' || 
        r === 'ROLE_ADMIN' || 
        r === 'ADMINISTRATOR');
    }
    
    return false;
  }

  isAgent(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.roles.includes('AGENT');
  }

  // Add method to decode JWT token and extract role info
  decodeToken(token: string): any {
    try {
      // Split the token into its three parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode the payload part (middle part)
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Get roles from token
  getRolesFromToken(token: string): string[] {
    const decoded = this.decodeToken(token);
    if (!decoded) return [];
    
    // Check different possible locations of roles in the JWT payload
    // Common claim names for roles in JWT tokens
    const roles = decoded.roles || decoded.authorities || decoded.scope || 
                 decoded.scopes || decoded.permissions || decoded.role || [];
    
    // If roles is a string (space-separated format used in some JWT implementations)
    if (typeof roles === 'string') {
      return roles.split(' ');
    }
    
    // If roles is already an array
    if (Array.isArray(roles)) {
      return roles;
    }
    
    return [];
  }

  // Get the current user from BehaviorSubject or localStorage
  getCurrentUser(): UserResponse | null {
    const userJson = localStorage.getItem(this.userKey);
    
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as UserResponse;
        return user;
      } catch (error) {
        this.clearAuthData();
        return null;
      }
    }
    
    return null;
  }

  // Thêm phương thức mới để lấy thông tin người dùng theo ID
  fetchUserById(userId: string): Observable<UserResponse> {
    if (!userId) {
      return throwError(() => new Error('User ID is required'));
    }
    
    return this.http.get<BaseResponse<UserResponse>>(`${this.apiUrl}/auth/find/${userId}`)
      .pipe(
        map(response => {
          if (response && response.data) {
            return response.data;
          } else {
            throw new Error('Invalid user data format in response');
          }
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  public getUserIdFromToken(token?: string): string | null {
    // Sử dụng token được truyền vào hoặc lấy từ localStorage nếu không có
    const tokenToUse = token || this.getToken();
    if (!tokenToUse) {
      return null;
    }

    try {
      // JWT token có dạng: header.payload.signature
      const parts = tokenToUse.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Giải mã phần payload (phần thứ 2)
      const payload = JSON.parse(atob(parts[1]));
      console.log('Token payload for ID extraction:', payload);

      // Lấy user ID từ các claim phổ biến - thêm nhiều trường có thể chứa ID
      const userId = payload.sub || payload.user_id || payload.id || payload.userId || 
                    payload.sub_id || payload.subject || payload.uuid || payload.jti;
      if (userId) {
        return userId.toString();
      }

      return null;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private storeUser(user: UserResponse): void {
    console.log('Storing user in localStorage:', user);
    
    // Đảm bảo name property được thiết lập đúng
    if (!user.name) {
      if (user.firstName && user.lastName) {
        user.name = `${user.firstName} ${user.lastName}`;
      } else if (user.username) {
        user.name = user.username;
      } else if (user.email) {
        // Sử dụng phần trước @ của email làm tên
        const emailName = user.email.split('@')[0];
        user.name = emailName;
      } else {
        // Chỉ dùng một chuỗi mặc định kết hợp với mã ID
        const shortId = (user.id || '').substring(0, 6);
        user.name = 'User_' + shortId;
      }
    }
    
    // Kiểm tra nếu name đang bằng ID, thì thay bằng giá trị khác
    if (user.name === user.id) {
      if (user.username) {
        user.name = user.username;
      } else if (user.firstName && user.lastName) {
        user.name = `${user.firstName} ${user.lastName}`;
      } else if (user.email) {
        const emailName = user.email.split('@')[0];
        user.name = emailName;
      } else {
        const shortId = (user.id || '').substring(0, 6);
        user.name = 'User_' + shortId;
      }
    }
    
    // Đảm bảo có giá trị cho roles nếu chưa có
    if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      user.roles = ['USER'];
    }
    
    console.log('User to be stored after formatting:', user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  public clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Kiểm tra token có hợp lệ không
      const decoded = this.decodeToken(token);
      if (!decoded) return false;
      
      // Kiểm tra token đã hết hạn chưa
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        this.clearAuthData(); // Xóa token đã hết hạn
        return false;
      }
      
      // Kiểm tra user có tồn tại không
      const user = this.getCurrentUser();
      return !!user;
    } catch (e) {
      this.clearAuthData(); // Xóa token không hợp lệ
      return false;
    }
  }

  // Cập nhật thông tin người dùng hiện tại mà không cần đăng nhập lại
  updateCurrentUser(user: UserResponse): void {
    if (user && user.id) {
      // Đảm bảo tên hiển thị đúng trước khi lưu
      if (!user.name || user.name === user.id) {
        if (user.firstName && user.lastName) {
          user.name = `${user.firstName} ${user.lastName}`;
        } else if (user.username && user.username !== user.id) {
          user.name = user.username;
        } else {
          user.name = 'User';
        }
      }
      
      // Lưu vào localStorage và BehaviorSubject
      this.storeUser(user);
      this.currentUserSubject.next(user);
    }
  }
}