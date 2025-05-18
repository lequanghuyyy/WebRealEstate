import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { PropertyService } from '../../services/property.service';
import { Transaction } from '../../models/transaction.model';
import { TransactionStatus } from '../../models/transaction.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PaymentService } from '../../services/payment.service';import { TransactionStyle, PaymentMethod } from '../../models/payment.model';import { createPaymentRequest } from '../../utils/payment-utils';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class BuyComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  isLoggedIn: boolean = false;
  
  // Stats
  totalTransactions: number = 0;
  completedTransactions: number = 0;
  pendingTransactions: number = 0;
  
  // Expose enum to the template
  transactionStatusEnum = TransactionStatus;
  
  constructor(
    private transactionService: TransactionService,
    private propertyService: PropertyService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Check if user is logged in
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      this.loadTransactions();
      // Set an interval to check for expired transactions every hour
      setInterval(() => this.checkExpiredTransactions(), 60 * 60 * 1000);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Please log in to view your purchase transactions.';
    }
  }
  
  loadTransactions(): void {
    this.isLoading = true;
    
    // Use the specific method for buy transactions
    this.transactionService.getBuyTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        
        // Process each transaction to load property details if missing
        const requests = data.map(transaction => {
          // If the property is missing title or has only ID, fetch it by ID
          if (transaction.property && transaction.property.id) {
            return this.propertyService.getPropertyById(transaction.property.id.toString()).pipe(
              map(property => {
                // Update the transaction with property details
                transaction.property.title = property.title;
                
                // Save propertyTitle for consistency
                transaction.propertyTitle = property.title;
                
                return transaction;
              }),
              catchError(error => {
                console.error(`Error loading property details for ID ${transaction.property.id}:`, error);
                // Return the original transaction if there was an error
                return of(transaction);
              })
            );
          }
          // If property title exists, just return the transaction
          return of(transaction);
        });
        
        // Use forkJoin to wait for all requests to complete
        forkJoin(requests).subscribe({
          next: (updatedTransactions) => {
            this.transactions = updatedTransactions;
            
            // Log transaction status values for debugging
            console.log('Transaction statuses:', this.transactions.map(t => t.status));
            console.log('TransactionStatus.PENDING value:', TransactionStatus.PENDING);
            
            // Filter transactions with case-insensitive comparison
            this.filteredTransactions = updatedTransactions.filter(t => 
              t.status.toUpperCase() === TransactionStatus.PENDING
            );
            
            this.calculateStats();
            this.isLoading = false;
            
            // Check for expired transactions
            this.checkExpiredTransactions();
          },
          error: (error) => {
            console.error('Error processing transactions:', error);
            this.errorMessage = 'Failed to process transaction data.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.errorMessage = 'Failed to load transaction data.';
        this.isLoading = false;
      }
    });
  }
  
  checkExpiredTransactions(): void {
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Filter for pending transactions that are more than 1 day old
    const expiredTransactions = this.transactions.filter(transaction => {
      if (transaction.status !== TransactionStatus.PENDING) {
        return false;
      }
      
      const transactionDate = new Date(transaction.date);
      const timeDiff = now.getTime() - transactionDate.getTime();
      return timeDiff > oneDayInMs;
    });
    
    // Cancel each expired transaction
    expiredTransactions.forEach(transaction => {
      if (transaction.id) {
        this.transactionService.cancelTransaction(transaction.id.toString()).subscribe({
          next: () => {
            console.log(`Transaction ${transaction.id} expired and automatically cancelled`);
            // Reload transactions to update the UI
            this.loadTransactions();
          },
          error: (error) => {
            console.error(`Error cancelling expired transaction ${transaction.id}:`, error);
          }
        });
      }
    });
  }
  
  calculateStats(): void {
    this.totalTransactions = this.transactions.length;
    this.completedTransactions = this.transactions.filter(t => t.status === TransactionStatus.COMPLETED).length;
    this.pendingTransactions = this.transactions.filter(t => t.status === TransactionStatus.PENDING).length;
  }
  
  filterByStatus(event: any): void {
    const status = event.target.value;
    
    if (status === 'all') {
      this.filteredTransactions = [...this.transactions];
    } else {
      // Log the status values for debugging
      console.log('Filtering by status:', status);
      console.log('TransactionStatus.PENDING value:', TransactionStatus.PENDING);
      
      // Make the comparison case-insensitive
      this.filteredTransactions = this.transactions.filter(t => {
        console.log('Transaction status:', t.status, 'Comparing with:', status);
        return t.status.toUpperCase() === status.toUpperCase();
      });
    }
  }
  
  filterByDate(event: any): void {
    const dateRange = event.target.value;
    
    if (dateRange === 'all') {
      this.filteredTransactions = [...this.transactions];
      return;
    }
    
    const now = new Date();
    let fromDate = new Date();
    
    if (dateRange === 'month') {
      fromDate.setMonth(now.getMonth() - 1);
    } else if (dateRange === 'quarter') {
      fromDate.setMonth(now.getMonth() - 3);
    } else if (dateRange === 'year') {
      fromDate.setFullYear(now.getFullYear() - 1);
    }
    
    this.filteredTransactions = this.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= fromDate && transactionDate <= now;
    });
  }
  
  resetFilters(): void {
    // Reset filters and show only PENDING transactions with case-insensitive comparison
    this.filteredTransactions = this.transactions.filter(t => t.status.toUpperCase() === TransactionStatus.PENDING);
    
    // Reset filter dropdowns to default
    const statusSelect = document.getElementById('status-filter') as HTMLSelectElement;
    const dateSelect = document.getElementById('date-filter') as HTMLSelectElement;
    const propertySelect = document.getElementById('property-filter') as HTMLSelectElement;
    
    if (statusSelect) statusSelect.value = TransactionStatus.PENDING;
    if (dateSelect) dateSelect.value = 'all';
    if (propertySelect) propertySelect.value = 'all';
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'pending';
      case TransactionStatus.COMPLETED:
        return 'completed';
      case TransactionStatus.CANCELLED:
        return 'canceled';
      default:
        return '';
    }
  }
  
  downloadReceipt(transactionId: string): void {
    // In a real app, this would call a service to generate and download a receipt
    alert(`Downloading receipt for transaction ${transactionId}`);
  }
  
  cancelTransaction(transactionId: string): void {
    if (confirm('Are you sure you want to cancel this transaction?')) {
      this.transactionService.cancelTransaction(transactionId).subscribe({
        next: () => {
          alert(`Transaction ${transactionId} has been cancelled`);
          // Update local state
          this.transactions = this.transactions.map(t => {
            if (t.id === transactionId) {
              return { ...t, status: TransactionStatus.CANCELLED, paymentStatus: 'refunded' };
            }
            return t;
          });
          
          this.filteredTransactions = this.filteredTransactions.filter(t => t.id !== transactionId);
          
          // Update stats
          this.calculateStats();
        },
        error: (error) => {
          console.error(`Error cancelling transaction ${transactionId}:`, error);
          alert('Failed to cancel transaction. Please try again.');
        }
      });
    }
  }
  
  // Get property name even if title is missing
  getPropertyName(transaction: Transaction): string {
    if (transaction.property && transaction.property.title && !transaction.property.title.includes('Property #')) {
      return transaction.property.title;
    } else if (transaction.propertyTitle) {
      return transaction.propertyTitle;
    } else if (transaction.property && transaction.property.id) {
      // Attempt to fetch property name on demand if not already loaded
      this.propertyService.getPropertyById(transaction.property.id.toString()).subscribe({
        next: (property) => {
          if (property && property.title) {
            // Update the transaction object with the fetched property title
            transaction.property.title = property.title;
                        
            // Also update transaction.propertyTitle for consistency
            transaction.propertyTitle = property.title;
                        
            // Force view refresh after fetching title
            this.filteredTransactions = [...this.filteredTransactions];
          }
        },
        error: (err) => {
          console.error(`Error fetching property details for ID ${transaction.property.id}:`, err);
        }
      });
            
      // Return a temporary value while the property details are being fetched
      return `Property #${transaction.property.id}`;
    } else {
      return 'Unknown Property';
    }
  }
  
  openPaymentDialog(transaction: Transaction): void {
    // Show custom payment dialog
    const dialogModal = document.createElement('div');
    dialogModal.classList.add('modal', 'fade', 'show');
    dialogModal.style.display = 'block';
    dialogModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Make Payment</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Please confirm your payment details for <strong>${transaction.property.title}</strong>:</p>
            <div class="mb-3">
              <label class="form-label">Amount:</label>
              <div class="form-control-plaintext">${this.formatCurrency(transaction.amount)}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Payment Method:</label>
              <select id="paymentMethod" class="form-select">
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Notes:</label>
              <textarea id="paymentNotes" class="form-control" rows="3" 
                       placeholder="Add any additional information about this payment (max 500 characters)" 
                       maxlength="500"></textarea>
              <small class="text-muted"><span id="chars-count">0</span>/500 characters</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirm-payment">Confirm Payment</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialogModal);
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop', 'fade', 'show');
    document.body.appendChild(backdrop);
    document.body.classList.add('modal-open');
    
    // Character counter for notes
    const notesField = dialogModal.querySelector('#paymentNotes') as HTMLTextAreaElement;
    const charsCount = dialogModal.querySelector('#chars-count') as HTMLElement;
    
    notesField.addEventListener('input', () => {
      charsCount.textContent = notesField.value.length.toString();
    });
    
    // Close button functionality
    const closeBtn = dialogModal.querySelector('.btn-close');
    const cancelBtn = dialogModal.querySelector('.btn-secondary');
    
    const closeModal = () => {
      dialogModal.remove();
      backdrop.remove();
      document.body.classList.remove('modal-open');
    };
    
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    
    // Confirm payment functionality
    const confirmBtn = dialogModal.querySelector('#confirm-payment');
    confirmBtn?.addEventListener('click', () => {
      const paymentMethodSelect = dialogModal.querySelector('#paymentMethod') as HTMLSelectElement;
      const notes = notesField.value;
      
      // Create the payment request
      const paymentRequest = {
        transactionId: transaction.id?.toString() || '',
        amount: transaction.amount,
        paymentMethod: paymentMethodSelect.value,
        commissionFee: transaction.amount * 0.03, // 3% for sales
        notes: notes,
        transactionStyle: TransactionStyle.SALE,
        agentId: '',
        buyerId: transaction.buyerId?.toString() || ''
      };
      
      this.paymentService.processPayment(paymentRequest).subscribe({
        next: (response) => {
          // Update transaction status to COMPLETED
          if (transaction.id) {
            this.transactionService.completeTransaction(transaction.id.toString()).subscribe({
              next: () => {
                closeModal();
                alert('Payment processed successfully! Transaction status updated to COMPLETED.');
                
                // Update the transaction in the local state
                this.transactions = this.transactions.map(t => {
                  if (t.id === transaction.id) {
                    return { ...t, status: TransactionStatus.COMPLETED, paymentStatus: 'paid' };
                  }
                  return t;
                });
                
                // Remove from filtered list if only showing PENDING
                if (this.filteredTransactions.every(t => t.status === TransactionStatus.PENDING)) {
                  this.filteredTransactions = this.filteredTransactions.filter(t => t.id !== transaction.id);
                } else {
                  // Update in filtered list if showing all or COMPLETED
                  this.filteredTransactions = this.filteredTransactions.map(t => {
                    if (t.id === transaction.id) {
                      return { ...t, status: TransactionStatus.COMPLETED, paymentStatus: 'paid' };
                    }
                    return t;
                  });
                }
                
                this.calculateStats();
              },
              error: (error) => {
                console.error('Failed to update transaction status:', error);
                closeModal();
                alert('Payment processed but failed to update transaction status. Please refresh the page.');
              }
            });
          } else {
            closeModal();
            alert('Payment processed successfully!');
            this.loadTransactions();
          }
        },
        error: (error) => {
          alert('Failed to process payment: ' + (error.message || 'Unknown error'));
          console.error('Payment error:', error);
        }
      });
    });
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}