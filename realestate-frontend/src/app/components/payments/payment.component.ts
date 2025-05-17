import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { TransactionService } from '../../services/transaction.service';
import { ToastrWrapperService } from '../../services/toastr-wrapper.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  payments: any[] = [];
  filteredPayments: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  currentUser: any = null;
  
  // Active tab
  activeTab: 'all' | 'pending' | 'completed' = 'all';
  
  // Filters
  filterPaymentStatus: string = 'ALL';
  filterPaymentMethod: string = 'ALL';
  searchQuery: string = '';
  
  // Sort options
  sortField: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Summary data
  totalAmount: number = 0;
  pendingAmount: number = 0;
  
  // Payment details modal
  selectedPayment: any = null;
  
  // Pagination
  pageSize: number = 10;
  currentPage: number = 0; // Changed to 0-based for backend compatibility
  totalPages: number = 1;
  totalItems: number = 0;
  
  // Math object for template use
  Math = Math;

  constructor(
    private authService: AuthService,
    private paymentService: PaymentService,
    private transactionService: TransactionService,
    private toastr: ToastrWrapperService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'You must be logged in to view this page.';
      this.isLoading = false;
      return;
    }
    
    // Get user data
    this.currentUser = this.authService.getCurrentUser();
    
    // Load payments data
    this.loadPayments();
  }

  // Change active tab
  changeTab(tab: 'all' | 'pending' | 'completed'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  loadPayments(): void {
    this.isLoading = true;
    
    // Use the payment service to get data with pagination
    this.paymentService.getAgentPayments(this.currentUser.id, this.currentPage).subscribe({
      next: (pageData) => {
        this.payments = pageData.content;
        this.totalItems = pageData.totalElements;
        this.totalPages = pageData.totalPages;
        this.applyFilters();
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.errorMessage = 'Failed to load payments. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    // Start with all payments
    this.filteredPayments = [...this.payments];
    
    // Apply status filter based on active tab
    if (this.activeTab === 'pending') {
      this.filteredPayments = this.filteredPayments.filter(p => p.paymentStatus === 'PENDING');
    } else if (this.activeTab === 'completed') {
      this.filteredPayments = this.filteredPayments.filter(p => p.paymentStatus === 'COMPLETED');
    }
    
    // Apply payment method filter
    if (this.filterPaymentMethod !== 'ALL') {
      this.filteredPayments = this.filteredPayments.filter(p => 
        p.paymentMethod === this.filterPaymentMethod
      );
    }
    
    // Apply search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      this.filteredPayments = this.filteredPayments.filter(p => 
        p.id.toLowerCase().includes(query) || 
        p.transactionId.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    this.sortPayments();
  }
  
  sortPayments(): void {
    this.filteredPayments.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Determine which field to sort by
      switch (this.sortField) {
        case 'amount':
          valueA = a.amount;
          valueB = b.amount;
          break;
        case 'method':
          valueA = a.paymentMethod;
          valueB = b.paymentMethod;
          break;
        case 'status':
          valueA = a.paymentStatus;
          valueB = b.paymentStatus;
          break;
        case 'date':
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }
      
      // Perform the sort
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  updateSort(field: string): void {
    if (this.sortField === field) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to descending
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    
    this.sortPayments();
  }

  resetFilters(): void {
    this.activeTab = 'all';
    this.filterPaymentMethod = 'ALL';
    this.searchQuery = '';
    this.applyFilters();
  }

  calculateSummary(): void {
    this.totalAmount = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
    this.pendingAmount = this.payments
      .filter(payment => payment.paymentStatus === 'PENDING')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getPaginatedPayments(): any[] {
    return this.filteredPayments;
  }

  changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.loadPayments(); // Reload data from backend with new page
    }
  }

  getFormattedCurrency(amount: number | undefined): string {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  }

  getDateFormatted(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'status-success';
      case 'PENDING': return 'status-pending';
      case 'FAILED': return 'status-danger';
      default: return '';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'CREDIT_CARD': return 'fa-credit-card';
      case 'BANK_TRANSFER': return 'fa-university';
      case 'CASH': return 'fa-money-bill';
      default: return 'fa-credit-card';
    }
  }
  
  // View payment details
  viewPaymentDetails(payment: any): void {
    if (!payment || !payment.transactionId) {
      this.toastr.error('Cannot view payment details: Invalid payment data');
      return;
    }
    
    this.isLoading = true;
    this.paymentService.getPaymentByTransactionId(payment.transactionId).subscribe({
      next: (paymentDetails) => {
        console.log('Payment details received:', paymentDetails);
        console.log('Notes field:', paymentDetails.notes);
        // Check if all expected fields are present
        const expectedFields = ['id', 'transactionId', 'amount', 'paymentMethod', 'paymentStatus', 'notes'];
        const missingFields = expectedFields.filter(field => !Object.prototype.hasOwnProperty.call(paymentDetails, field));
        if (missingFields.length > 0) {
          console.warn('Missing expected fields in payment response:', missingFields);
        }
        
        this.isLoading = false;
        this.selectedPayment = paymentDetails;
        
        // Add body class to prevent scrolling when modal is open
        document.body.classList.add('modal-open');
      },
      error: (error) => {
        console.error('Error fetching payment details:', error);
        this.isLoading = false;
        this.toastr.error('Failed to load payment details. Please try again.');
      }
    });
  }
  
  // Close payment details modal
  closePaymentDetails(event?: MouseEvent): void {
    if (event && (event.target as HTMLElement).className !== 'payment-detail-modal') {
      return;
    }
    this.selectedPayment = null;
    
    // Remove body class to re-enable scrolling
    document.body.classList.remove('modal-open');
  }
  
  completePayment(payment: any): void {
    this.paymentService.updatePaymentStatus(payment.id, 'COMPLETED').subscribe({
      next: () => {
        this.toastr.success('Payment marked as completed');
        // Update local data
        payment.paymentStatus = 'COMPLETED';
        this.calculateSummary();
      },
      error: (error) => {
        console.error('Error completing payment:', error);
        this.toastr.error('Failed to update payment. Please try again.');
      }
    });
  }

  // Use backend pagination
  getPageNumbers(): number[] {
    const range = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(0, Math.min(
      this.currentPage - Math.floor(maxPagesToShow / 2),
      this.totalPages - maxPagesToShow
    ));
    const endPage = Math.min(startPage + maxPagesToShow - 1, this.totalPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  }

  getCurrentPageStart(): number {
    return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  getCurrentPageEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }
} 