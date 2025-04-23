import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { Payment } from '../../../models/payment.model';
import { PaymentService } from '../../../services/payment.service';

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
  `]
})
export class AdminPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  isLoading = false;
  errorMessage = '';
  
  filterForm: FormGroup;
  selectedPayment: Payment | null = null;
  isModalOpen = false;

  constructor(
    private paymentService: PaymentService,
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
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.paymentService.getAllPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.filteredPayments = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load payments: ' + error.message;
        this.isLoading = false;
      }
    });
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
  }

  private matchesSearchTerm(payment: Payment, searchTerm: string): boolean {
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

  openPaymentDetails(payment: Payment): void {
    this.selectedPayment = payment;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPayment = null;
  }

  updatePaymentStatus(payment: Payment, newStatus: 'pending' | 'completed' | 'failed' | 'refunded'): void {
    this.isLoading = true;
    
    this.paymentService.updatePayment({ 
      id: payment.id, 
      status: newStatus 
    }).subscribe({
      next: (updatedPayment) => {
        // Update the payment in both arrays
        const index = this.payments.findIndex(p => p.id === updatedPayment.id);
        if (index !== -1) {
          this.payments[index] = updatedPayment;
        }
        
        const filteredIndex = this.filteredPayments.findIndex(p => p.id === updatedPayment.id);
        if (filteredIndex !== -1) {
          this.filteredPayments[filteredIndex] = updatedPayment;
        }
        
        this.isLoading = false;
        
        // If we're updating the selected payment, update it
        if (this.selectedPayment && this.selectedPayment.id === updatedPayment.id) {
          this.selectedPayment = updatedPayment;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to update payment status: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  deletePayment(payment: Payment): void {
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

  // Helper methods for UI
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed': return 'badge bg-success';
      case 'pending': return 'badge bg-warning text-dark';
      case 'failed': return 'badge bg-danger';
      case 'refunded': return 'badge bg-info text-dark';
      default: return 'badge bg-secondary';
    }
  }

  getMethodBadgeClass(method: string): string {
    switch (method) {
      case 'credit_card': return 'badge bg-primary';
      case 'bank_transfer': return 'badge bg-secondary';
      case 'paypal': return 'badge bg-info text-dark';
      case 'cash': return 'badge bg-success';
      default: return 'badge bg-dark';
    }
  }

  getPaymentTypeBadgeClass(type: string): string {
    switch (type) {
      case 'full': return 'badge bg-success';
      case 'installment': return 'badge bg-primary';
      case 'commission': return 'badge bg-info text-dark';
      case 'fee': return 'badge bg-secondary';
      default: return 'badge bg-dark';
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}