import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { PaymentResponse, PaymentStatus } from '../../../models/payment.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class PaymentHistoryComponent implements OnInit {
  payments: PaymentResponse[] = [];
  filteredPayments: PaymentResponse[] = [];
  selectedPayment: PaymentResponse | null = null;
  isLoading = true;
  errorMessage = '';
  
  // Stats
  totalPayments = 0;
  completedPayments = 0;
  pendingPayments = 0;
  
  // Filter settings
  statusFilter = 'all';
  dateFilter = 'all';
  methodFilter = 'all';
  
  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadPayments();
  }
  
  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.errorMessage = 'User not authenticated';
      this.isLoading = false;
      return;
    }
    
    this.paymentService.getPaymentsByAgent(currentUser.id).subscribe({
      next: (data) => {
        this.payments = data;
        this.filteredPayments = [...data];
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.errorMessage = 'Failed to load payment data.';
        this.isLoading = false;
      }
    });
  }
  
  calculateStats(): void {
    this.totalPayments = this.payments.length;
    this.completedPayments = this.payments.filter(p => p.paymentStatus === PaymentStatus.COMPLETED).length;
    this.pendingPayments = this.payments.filter(p => p.paymentStatus === PaymentStatus.PENDING).length;
  }
  
  viewPaymentDetails(payment: PaymentResponse): void {
    this.selectedPayment = payment;
    document.body.classList.add('modal-open');
  }
  
  closePaymentDetails(): void {
    this.selectedPayment = null;
    document.body.classList.remove('modal-open');
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'completed';
      case 'PENDING':
        return 'pending';
      case 'FAILED':
        return 'failed';
      default:
        return '';
    }
  }
  
  applyFilters(): void {
    let filtered = [...this.payments];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(p => p.paymentStatus === this.statusFilter);
    }
    
    // Apply method filter
    if (this.methodFilter !== 'all') {
      filtered = filtered.filter(p => p.paymentMethod === this.methodFilter);
    }
    
    // Apply date filter
    if (this.dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (this.dateFilter) {
        case 'month':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          cutoffDate = new Date(0); // Beginning of time
      }
      
      filtered = filtered.filter(p => new Date(p.paymentDate) >= cutoffDate);
    }
    
    this.filteredPayments = filtered;
  }
  
  resetFilters(): void {
    this.statusFilter = 'all';
    this.dateFilter = 'all';
    this.methodFilter = 'all';
    this.filteredPayments = [...this.payments];
  }
} 