import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { Transaction } from '../../../models/transaction.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { TransactionStyle } from '../../../models/payment.model';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    agents: number;
    buyers?: number;
    renters?: number;
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
    salesCommissions?: number;
    rentalCommissions?: number;
  };
  properties: {
    total: number;
    forSale: number;
    forRent: number;
    pending?: number;
  };
  _endpointStatus?: {
    users: boolean;
    agents: boolean;
    buyers: boolean;
    renters: boolean;
    sales: boolean;
    rentals: boolean;
    pending: boolean;
    completed: boolean;
    commission: boolean;
    properties: boolean;
    propertiesSale: boolean;
    propertiesRent: boolean;
    propertiesPending: boolean;
    totalRevenue: boolean;
    monthlyRevenue: boolean;
  };
}

interface EndpointStatus {
  users: boolean;
  agents: boolean;
  buyers: boolean;
  renters: boolean;
  sales: boolean;
  rentals: boolean;
  pending: boolean;
  completed: boolean;
  commission: boolean;
  properties: boolean;
  propertiesSale: boolean;
  propertiesRent: boolean;
  propertiesPending: boolean;
  totalRevenue: boolean;
  monthlyRevenue: boolean;
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
    users: { total: 0, active: 0, agents: 0, buyers: 0, renters: 0 },
    transactions: { total: 0, sales: 0, rentals: 0, pending: 0, completed: 0 },
    revenue: { 
      total: 0, 
      commissions: 0, 
      thisMonth: 0, 
      salesCommissions: 0, 
      rentalCommissions: 0 
    },
    properties: { total: 0, forSale: 0, forRent: 0, pending: 0 }
  };
  recentTransactions: Transaction[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUser: any;
  
  apiStatus: boolean = false;
  endpointStatus: EndpointStatus | null = null;
  showEndpointDetails: boolean = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Kiểm tra người dùng đã đăng nhập và có token chưa
    if (!this.authService.isLoggedIn() || !this.authService.getToken()) {
      this.error = 'Bạn cần đăng nhập để xem dashboard';
      console.error('Token không tồn tại hoặc người dùng chưa đăng nhập');
      this.isLoading = false;
      // Điều hướng đến trang đăng nhập
      this.router.navigate(['/login']);
      return;
    }
    
    // Kiểm tra token chi tiết
    const tokenDetail = this.authService.getTokenDetail();
    if (tokenDetail) {
      console.log('TOKEN VALUE:', tokenDetail.value);
      console.log('TOKEN DECODED:', tokenDetail.decoded);
      
      // Thử gọi API trực tiếp với token
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${tokenDetail.value}`
      });
      
      console.log('Thử gọi API trực tiếp với token');
      this.http.get(`${environment.apiUrl}/users/count`, { headers }).subscribe({
        next: (response) => {
          console.log('Kết quả API gọi trực tiếp:', response);
        },
        error: (err) => {
          console.error('Lỗi khi gọi trực tiếp:', err);
        }
      });
    }
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    this.apiStatus = false;
    this.endpointStatus = {
      users: false,
      agents: false,
      buyers: false,
      renters: false,
      sales: false,
      rentals: false,
      pending: false,
      completed: false,
      commission: false,
      properties: false,
      propertiesSale: false,
      propertiesRent: false,
      propertiesPending: false,
      totalRevenue: false,
      monthlyRevenue: false
    };
    
    // Increase timeout for API calls
    const fallbackTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.error = 'API response timeout. Using fallback data.';
        this.provideFallbackData();
      }
    }, 15000); // 15 second timeout
    
    // Load dashboard stats and commission data
    forkJoin({
      dashboardStats: this.adminService.getDashboardStats(),
      salesCommission: this.adminService.getCommissionByTransactionStyle(TransactionStyle.SALE),
      rentalCommission: this.adminService.getCommissionByTransactionStyle(TransactionStyle.RENT)
    }).subscribe({
      next: (results) => {
        clearTimeout(fallbackTimeout);
        
        // Set basic dashboard stats
        this.stats = results.dashboardStats;
        
        // Add commission data
        this.stats.revenue.salesCommissions = results.salesCommission;
        this.stats.revenue.rentalCommissions = results.rentalCommission;
        
        this.isLoading = false;
        this.apiStatus = true;
        
        // Record which endpoints successfully connected
        if (results.dashboardStats._endpointStatus) {
          this.endpointStatus = results.dashboardStats._endpointStatus;
        }
        
        console.log('Dashboard data loaded successfully:', this.stats);
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
    this.apiStatus = false;
    this.stats = {
      users: {
        total: 250,
        active: 210,
        agents: 25,
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
        thisMonth: 12500,
        salesCommissions: 26250, // 70% of total commissions
        rentalCommissions: 11250  // 30% of total commissions
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

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined) {
      return '$0';
    }
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
  
  toggleEndpointDetails(): void {
    this.showEndpointDetails = !this.showEndpointDetails;
  }
} 