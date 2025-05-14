import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Payment, PaymentResponse, PaymentMethod, PaymentStatus, TransactionStyle } from '../../../models/payment.model';
import { PaymentService } from '../../../services/payment.service';
import { TransactionService } from '../../../services/transaction.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

// Extended Payment interface to include the transactionType property
interface ExtendedPayment extends Payment {
  transactionType?: string;
  isUpdating: boolean;
}

declare var bootstrap: any; // For TypeScript to recognize bootstrap

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './admin-payments.component.html',
  styles: [`
    .admin-payments {
      padding: 1rem;
    }
    
    .content-header {
      margin-bottom: 1.5rem;
    }
    
    .page-title {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .subtitle {
      color: #6c757d;
      margin-bottom: 0;
    }
    
    .pagination-controls {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
    }
    
    /* Modal fixes */
    .modal-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1050;
    }
    
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      opacity: 0.5;
      z-index: 1040;
    }
    
    .modal {
      z-index: 1050;
      display: block;
    }
    
    .modal-content {
      box-shadow: 0 5px 15px rgba(0,0,0,.5);
      background-color: white;
      border-radius: 5px;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    .modal-body {
      padding: 20px;
      max-height: calc(90vh - 120px);
      overflow-y: auto;
    }
  `]
})
export class AdminPaymentsComponent implements OnInit {
  payments: ExtendedPayment[] = [];
  filteredPayments: ExtendedPayment[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Pagination
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;
  totalElements = 0;
  
  filterForm: FormGroup;
  selectedPayment: ExtendedPayment | null = null;
  isModalOpen = false;

  constructor(
    private paymentService: PaymentService,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      status: [''],
      paymentType: [''],
      method: ['']
    });
  }

  ngOnInit(): void {
    this.loadPayments();
    this.setupFilterListeners();
    
    // Initialize Bootstrap dropdowns after component loads and data is rendered
    setTimeout(() => {
      this.initBootstrapComponents();
    }, 500);
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.paymentService.getAllPayments(this.currentPage).subscribe({
      next: (pageData) => {
        this.totalPages = pageData.totalPages;
        this.totalElements = pageData.totalElements;
        this.currentPage = pageData.number;
        
        // Map the response to our Payment model
        const mappedPayments = pageData.content.map((paymentResponse: PaymentResponse) => 
          this.mapResponseToPayment(paymentResponse)
        );
        
        // Load transaction types for all payments with transaction IDs
        this.loadTransactionTypes(mappedPayments);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load payments: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  private loadTransactionTypes(payments: ExtendedPayment[]): void {
    const paymentsWithTransactionId = payments.filter(p => p.transactionId);
    
    if (paymentsWithTransactionId.length === 0) {
      this.payments = payments;
      this.filteredPayments = [...payments];
      this.isLoading = false;
      this.initBootstrapComponents(); // Initialize dropdowns after data loads
      return;
    }

    // Create observable array for all transaction type requests
    const requests = paymentsWithTransactionId.map(payment => 
      this.transactionService.findTransactionTypeById(payment.transactionId!).pipe(
        catchError(() => of('UNKNOWN'))
      )
    );

    forkJoin(requests).pipe(
      finalize(() => {
        this.isLoading = false;
        this.initBootstrapComponents(); // Initialize dropdowns after data loads with types
      })
    ).subscribe({
      next: (transactionTypes) => {
        // Assign transaction types to payments
        let typeIndex = 0;
        this.payments = payments.map(payment => {
          if (payment.transactionId) {
            payment.transactionType = transactionTypes[typeIndex++];
          }
          return payment;
        });
        
        this.filteredPayments = [...this.payments];
      },
      error: (error) => {
        console.error('Error loading transaction types:', error);
        this.payments = payments;
        this.filteredPayments = [...payments];
      }
    });
  }

  // Map the PaymentResponse from API to our Payment model
  private mapResponseToPayment(response: PaymentResponse): ExtendedPayment {
    // Convert string values to their enum counterparts
    const paymentMethod = response.paymentMethod as PaymentMethod;
    const paymentStatus = response.paymentStatus as PaymentStatus;
    const transactionStyle = response.transactionStyle;
    
    return {
      id: response.id,
      transactionId: response.transactionId,
      amount: response.amount,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paymentDate: response.paymentDate,
      commissionFee: response.commissionFee,
      notes: response.notes,
      createdAt: response.createdAt,
      transactionStyle: transactionStyle,
      
      // Map to fields expected by the template
      status: response.paymentStatus.toLowerCase(),
      paymentType: response.transactionStyle === TransactionStyle.SALE ? 'full' : 'installment',
      method: response.paymentMethod.toLowerCase().replace('_', ' '),
      date: response.paymentDate,
      transactionType: undefined, // Will be filled by loadTransactionTypes
      isUpdating: false
    };
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredPayments = this.payments.filter(payment => {
      // Search term filter
      if (filters.searchTerm && !this.matchesSearchTerm(payment, filters.searchTerm)) {
        return false;
      }
      
      // Status filter
      if (filters.status && payment.status !== filters.status) {
        return false;
      }
      
      // Payment type filter
      if (filters.paymentType && payment.paymentType !== filters.paymentType) {
        return false;
      }
      
      // Payment method filter
      if (filters.method && payment.method !== filters.method) {
        return false;
      }
      
      return true;
    });
    
    // Initialize dropdowns after filtering
    setTimeout(() => {
      this.initBootstrapComponents();
    }, 100);
  }

  private matchesSearchTerm(payment: ExtendedPayment, searchTerm: string): boolean {
    searchTerm = searchTerm.toLowerCase();
    return (
      payment.id.toLowerCase().includes(searchTerm) ||
      (payment.transactionId ? payment.transactionId.toLowerCase().includes(searchTerm) : false) ||
      (payment.propertyTitle ? payment.propertyTitle.toLowerCase().includes(searchTerm) : false) ||
      (payment.payerName ? payment.payerName.toLowerCase().includes(searchTerm) : false) ||
      (payment.recipientName ? payment.recipientName.toLowerCase().includes(searchTerm) : false) ||
      (payment.reference ? payment.reference.toLowerCase().includes(searchTerm) : false)
    );
  }

  openPaymentDetails(payment: ExtendedPayment): void {
    this.selectedPayment = payment;
    this.isModalOpen = true;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPayment = null;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  updatePaymentStatus(payment: ExtendedPayment, newStatus: string): void {
    if (payment.isUpdating) {
      return; // Prevent multiple simultaneous updates
    }
    
    // Get the previous status for reverting if there's an error
    const previousStatus = payment.status;
    
    // Update optimistically in the UI
    payment.isUpdating = true;
    payment.status = newStatus.toLowerCase();
    
    this.paymentService.updatePaymentStatus(payment.id, newStatus).subscribe({
      next: (updatedPayment) => {
        const mappedPayment = this.mapResponseToPayment(updatedPayment);
        
        // Preserve the transaction type from the original payment
        if (payment.transactionType) {
          mappedPayment.transactionType = payment.transactionType;
        }
        
        // Update the payment in both arrays
        const index = this.payments.findIndex(p => p.id === mappedPayment.id);
        if (index !== -1) {
          this.payments[index] = mappedPayment;
        }
        
        const filteredIndex = this.filteredPayments.findIndex(p => p.id === mappedPayment.id);
        if (filteredIndex !== -1) {
          this.filteredPayments[filteredIndex] = mappedPayment;
        }
        
        // If we're updating the selected payment, update it
        if (this.selectedPayment && this.selectedPayment.id === mappedPayment.id) {
          this.selectedPayment = mappedPayment;
        }
        
        // Show success message
        this.showToast(`Payment ${payment.id} status changed to ${newStatus.toLowerCase()}`, 'success');
        
        // Remove the updating flag
        payment.isUpdating = false;
      },
      error: (error) => {
        // Revert to previous status on error
        payment.status = previousStatus;
        payment.isUpdating = false;
        
        // Show error message
        this.errorMessage = 'Failed to update payment status: ' + error.message;
        this.showToast(`Failed to update payment status: ${error.message}`, 'error');
      }
    });
  }

  deletePayment(payment: ExtendedPayment): void {
    if (confirm(`Are you sure you want to delete payment ${payment.id}?`)) {
      this.isLoading = true;
      
      this.paymentService.deletePayment(payment.id).subscribe({
        next: () => {
          // Remove from arrays
          this.payments = this.payments.filter(p => p.id !== payment.id);
          this.filteredPayments = this.filteredPayments.filter(p => p.id !== payment.id);
          this.isLoading = false;
          
          // Close modal if this payment was selected
          if (this.selectedPayment && this.selectedPayment.id === payment.id) {
            this.closeModal();
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete payment: ' + error.message;
          this.isLoading = false;
        }
      });
    }
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPayments();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPayments();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPayments();
    }
  }

  // Helper methods for UI
  getStatusBadgeClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'badge bg-success';
      case 'pending': return 'badge bg-warning text-dark';
      case 'failed': return 'badge bg-danger';
      case 'refunded': return 'badge bg-info text-dark';
      default: return 'badge bg-secondary';
    }
  }

  getMethodBadgeClass(method: string | undefined): string {
    switch (method) {
      case 'credit_card': return 'badge bg-primary';
      case 'bank_transfer': return 'badge bg-secondary';
      case 'paypal': return 'badge bg-info text-dark';
      case 'cash': return 'badge bg-success';
      default: return 'badge bg-dark';
    }
  }

  getTransactionTypeBadgeClass(type: string | undefined): string {
    switch (type) {
      case 'SALE': return 'badge bg-primary';
      case 'RENT': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  formatAmount(amount: number | undefined): string {
    if (amount === undefined) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Initialize Bootstrap components
  private initBootstrapComponents(): void {
    try {
      // Initialize all dropdowns on the page
      const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
      dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
      });
      console.log('Bootstrap dropdowns initialized');
    } catch (error) {
      console.error('Error initializing Bootstrap components:', error);
    }
  }

  // Helper method to show toast messages
  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Implementation depends on your toast library
    // For now, just log to console
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Create a simple toast element
    const toast = document.createElement('div');
    toast.className = `toast position-fixed bottom-0 end-0 m-3 ${type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info'} text-white`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">${type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info'}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    document.body.appendChild(toast);
    
    try {
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
      
      // Remove the toast after it's hidden
      toast.addEventListener('hidden.bs.toast', () => {
        document.body.removeChild(toast);
      });
    } catch (e) {
      console.error('Error showing toast:', e);
      // Fallback: remove after 3 seconds
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  }
}