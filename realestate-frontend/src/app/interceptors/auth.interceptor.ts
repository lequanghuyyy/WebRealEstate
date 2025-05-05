import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Tránh vòng lặp chuyển hướng - biến này được khai báo bên ngoài để giữ trạng thái
let isLoggingOut = false;

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Kiểm tra nếu URL có phải là API công khai
  const isPublicEndpoint = (url: string): boolean => {
    const publicEndpoints = [
      '/api/v1/listings/byViews',
      '/api/listings/byViews',
      '/api/v1/users/auth/login',
      '/api/v1/users/auth/signup',
      '/api/v1/auth/login',
      '/api/auth/login',
      'api/v1/listings/sale',
      'api/v1/listings/rent',
      'api/v1/listings/find',
      '/api/v1/public',
      '/api/public',
      '/api/health',
      '/api/v1/health',
      '/api/users', 
      '/api/me',
      '/api/user'
    ];
    
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  // Trong phương thức intercept
  if (isPublicEndpoint(request.url) || request.headers.has('X-Skip-Interceptor')) {
    return next(request);
  }

  // Get the token from auth service
  const token = authService.getToken();
  
  // If token exists, add it to request header
  if (token) {
    request = addTokenToRequest(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoggingOut) {
        // Đánh dấu đang trong quá trình logout để tránh vòng lặp
        isLoggingOut = true;
        console.log('Received 401, clearing auth data and redirecting to login');
        
        // Xóa dữ liệu xác thực cục bộ
        authService.clearAuthData();
        
        // Chuyển hướng đến trang đăng nhập
        router.navigate(['/login']).then(() => {
          // Reset trạng thái sau khi đã chuyển hướng
          setTimeout(() => {
            isLoggingOut = false;
          }, 2000);
        });
      }
      return throwError(() => error);
    })
  );
};

function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}