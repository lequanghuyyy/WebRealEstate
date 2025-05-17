import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  user: any;
  mobileMenuOpen: boolean = false;
  userDropdownOpen: boolean = false;
  
  // Navigation menu items
  menuItems = [
    { path: '/admin/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/admin/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/admin/agent-applications', icon: 'fas fa-user-check', label: 'Agent Applications' },
    { path: '/admin/listings', icon: 'fas fa-home', label: 'Listings' },
    { path: '/admin/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
    { path: '/admin/payments', icon: 'fas fa-dollar-sign', label: 'Payments' },
  ];
  
  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit(): void {
    // Get user information
    this.user = this.authService.getCurrentUser();
    
    if (!this.user) {
      // Try to force reload the user data
      this.authService.fetchCurrentUser().subscribe({
        next: (user) => {
          this.user = user;
          if (!this.checkAdminAccess()) {
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    
    if (!this.checkAdminAccess()) {
      return;
    }
    
    // Force navigation to dashboard if on the root /admin path
    if (this.router.url === '/admin') {
      this.router.navigate(['/admin/dashboard']);
    }
  }
  
  checkAdminAccess(): boolean {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return false;
    }
    
    return true;
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    // Close user dropdown if open
    if (this.mobileMenuOpen && this.userDropdownOpen) {
      this.userDropdownOpen = false;
    }
  }
  
  toggleUserDropdown(): void {
    this.userDropdownOpen = !this.userDropdownOpen;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 