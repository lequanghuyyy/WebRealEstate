import { Component } from '@angular/core';
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
export class AdminLayoutComponent {
  user: any;
  
  // Navigation menu items
  menuItems = [
    { path: '/admin/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/admin/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/admin/listings', icon: 'fas fa-home', label: 'Listings' },
    { path: '/admin/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
    { path: '/admin/payments', icon: 'fas fa-dollar-sign', label: 'Payments' },
    { path: '/admin/reviews', icon: 'fas fa-star', label: 'Reviews' },
    { path: '/admin/contacts', icon: 'fas fa-envelope', label: 'Contacts' }
  ];
  
  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getCurrentUser();
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 