import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get current user info
  const user = authService.getCurrentUser();
  
  // Check if user is logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }
  
  // Check if user has admin role
  if (!authService.isAdmin()) {
    router.navigate(['/']);
    return false;
  }
  
  // Allow access to admin routes
  return true;
};