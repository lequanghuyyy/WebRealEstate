import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { Transaction } from '../../../models/transaction.model';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    agents: number;
  };
  transactions: {
    total: number;
    sales: number;
    rentals: number;
    pending: number;
    completed: number;
  };
  revenue: {
    total: number;
    commissions: number;
    thisMonth: number;
  };
  properties: {
    total: number;
    forSale: number;
    forRent: number;
    pending: number;
  };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats = {
    users: { total: 0, active: 0, agents: 0 },
    transactions: { total: 0, sales: 0, rentals: 0, pending: 0, completed: 0 },
    revenue: { total: 0, commissions: 0, thisMonth: 0 },
    properties: { total: 0, forSale: 0, forRent: 0, pending: 0 }
  };
  recentTransactions: Transaction[] = [];
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
    this.error = null;
    
    // Increase timeout for API calls
    const fallbackTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.error = 'API response timeout. Using fallback data.';
        this.provideFallbackData();
      }
    }, 15000); // 15 second timeout
    
    this.adminService.getDashboardStats().subscribe({
      next: (data: DashboardStats) => {
        clearTimeout(fallbackTimeout);
        this.stats = data;
        this.isLoading = false;
        console.log('Dashboard data loaded successfully:', data);
      },
      error: (err: Error) => {
        clearTimeout(fallbackTimeout);
        this.error = 'Failed to load dashboard data from API. Using fallback data.';
        console.error('Dashboard API error:', err);
        this.provideFallbackData();
      }
    });

    // Get recent transactions
    this.adminService.getTransactions().subscribe({
      next: (transactions: Transaction[]) => {
        // Sort by date (newest first) and take first 5
        this.recentTransactions = transactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
      },
      error: (err: Error) => {
        console.error('Transactions API error:', err);
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
        rentals: 15,
        pending: 10,
        completed: 35
      },
      revenue: {
        total: 125000,
        commissions: 37500,
        thisMonth: 12500
      },
      properties: {
        total: 120,
        forSale: 80,
        forRent: 40,
        pending: 15
      }
    };
    
    this.recentTransactions = this.getFallbackTransactions();
  }

  getFallbackTransactions(): Transaction[] {
    return [
      {
        id: 'T001',
        propertyTitle: 'Modern Apartment in District 1',
        transactionType: 'sale',
        type: 'sale',
        amount: 250000,
        commissionFee: 7500,
        status: 'completed',
        paymentStatus: 'paid',
        date: new Date().toISOString().split('T')[0],
        property: {
          id: 'P001',
          title: 'Modern Apartment in District 1',
          image: 'assets/images/properties/apartment1.jpg'
        },
        client: {
          name: 'John Smith',
          email: 'john@example.com'
        }
      },
      {
        id: 'T002',
        propertyTitle: 'Luxury Villa with Pool',
        transactionType: 'sale',
        type: 'sale',
        amount: 450000,
        commissionFee: 13500,
        status: 'pending',
        paymentStatus: 'pending',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        property: {
          id: 'P002',
          title: 'Luxury Villa with Pool',
          image: 'assets/images/properties/villa1.jpg'
        },
        client: {
          name: 'Sarah Johnson',
          email: 'sarah@example.com'
        }
      },
      {
        id: 'T003',
        propertyTitle: 'Office Space Downtown',
        transactionType: 'rent',
        type: 'rent',
        amount: 2500,
        commissionFee: 1250,
        status: 'completed',
        paymentStatus: 'paid',
        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        property: {
          id: 'P003',
          title: 'Office Space Downtown',
          image: 'assets/images/properties/office1.jpg'
        },
        client: {
          name: 'Business Corp',
          email: 'info@business.com'
        }
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

  formatDate(date: string | Date): string {
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