import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {};
  recentTransactions: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUser: any;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Simulate data if service fails
    const fallbackTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.provideFallbackData();
      }
    }, 5000); // 5 second timeout
    
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        clearTimeout(fallbackTimeout);
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        clearTimeout(fallbackTimeout);
        this.error = 'Failed to load dashboard data. Using fallback data.';
        this.provideFallbackData();
      }
    });

    // Get recent transactions
    this.adminService.getTransactions().subscribe({
      next: (transactions) => {
        // Sort by date (newest first) and take first 5
        this.recentTransactions = transactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
      },
      error: (err) => {
        // Provide fallback transaction data
        this.recentTransactions = this.getFallbackTransactions();
      }
    });
  }

  provideFallbackData(): void {
    this.isLoading = false;
    this.stats = {
      users: {
        total: 250,
        active: 210,
        agents: 25
      },
      transactions: {
        total: 45,
        sales: 30,
        rentals: 15
      },
      revenue: {
        total: 125000,
        commissions: 37500,
        thisMonth: 12500
      },
      properties: {
        total: 120,
        forSale: 80,
        forRent: 40
      }
    };
    
    this.recentTransactions = this.getFallbackTransactions();
  }
  
  getFallbackTransactions(): any[] {
    return [
      {
        id: 'T001',
        propertyTitle: 'Modern Apartment in District 1',
        transactionType: 'sale',
        amount: 250000,
        status: 'completed',
        date: new Date()
      },
      {
        id: 'T002',
        propertyTitle: 'Luxury Villa with Pool',
        transactionType: 'sale',
        amount: 450000,
        status: 'pending',
        date: new Date(Date.now() - 86400000) // yesterday
      },
      {
        id: 'T003',
        propertyTitle: 'Office Space Downtown',
        transactionType: 'rent',
        amount: 2500,
        status: 'completed',
        date: new Date(Date.now() - 2 * 86400000) // 2 days ago
      }
    ];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  retryLoading(): void {
    this.error = null;
    this.loadDashboardData();
  }
} 