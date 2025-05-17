import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { PropertyService } from '../../services/property.service';
import { Transaction } from '../../models/transaction.model';
import { RentalStatus } from '../../models/transaction.model';
import { DefaultImageDirective } from '../../directives/default-image.directive';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PaymentService } from '../../services/payment.service';
import { TransactionStyle } from '../../models/payment.model';

@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, DefaultImageDirective]
})
export class RentComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Stats
  totalRentals: number = 0;
  activeRentals: number = 0;
  pendingApprovals: number = 0;
  completedTransactions: number = 0;
  pendingTransactions: number = 0;
  
  // Expose enum to the template
  rentalStatusEnum = RentalStatus;
  
  // Filter form
  filterForm: FormGroup;
  
  constructor(
    private transactionService: TransactionService,
    private propertyService: PropertyService,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      status: [RentalStatus.PENDING], // Default to showing PENDING
      dateRange: ['all'],
      propertyType: ['all']
    });
  }
  
  ngOnInit(): void {
    this.loadTransactions();
    
    // Subscribe to form value changes for filtering
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
    
    // Set an interval to check for expired transactions every hour
    setInterval(() => this.checkExpiredTransactions(), 60 * 60 * 1000);
  }
  
  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.errorMessage = 'No rental data available. The server is taking too long to respond.';
        console.log('Loading timeout reached, stopping loading state');
      }
    }, 10000); // 10 seconds timeout
    
    this.transactionService.getRentTransactions().subscribe({
      next: (data) => {
        clearTimeout(loadingTimeout); // Clear the timeout since we got data
        this.transactions = data;
        
        // If no transactions found, show error message
        if (data.length === 0) {
          this.isLoading = false;
          this.errorMessage = 'No rental transactions found.';
          return;
        }
        
        // Process each transaction to load property details if missing
        const requests = data.map(transaction => {
          // If the property is missing title or has only ID, fetch it by ID
          if (transaction.property && transaction.property.id && (!transaction.property.title || transaction.property.title.includes('Property #'))) {
            return this.propertyService.getPropertyById(transaction.property.id.toString()).pipe(
              map(property => {
                transaction.property.title = property.title;
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
            // Only show PENDING transactions by default
            this.filteredTransactions = updatedTransactions.filter(t => t.status === RentalStatus.PENDING);
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
        clearTimeout(loadingTimeout); // Clear the timeout on error
        console.error('Error loading rental transactions:', error);
        this.errorMessage = 'Failed to load rental data.';
        this.isLoading = false;
      }
    });
  }
  
  checkExpiredTransactions(): void {
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Filter for pending transactions that are more than 1 day old
    const expiredTransactions = this.transactions.filter(transaction => {
      if (transaction.status !== RentalStatus.PENDING) {
        return false;
      }
      
      const transactionDate = new Date(transaction.date);
      const timeDiff = now.getTime() - transactionDate.getTime();
      return timeDiff > oneDayInMs;
    });
    
    // Cancel each expired transaction
    expiredTransactions.forEach(transaction => {
      if (transaction.id) {
        this.transactionService.cancelTransaction(transaction.id.toString(), true).subscribe({
          next: () => {
            console.log(`Rental ${transaction.id} expired and automatically cancelled`);
            // Reload transactions to update the UI
            this.loadTransactions();
          },
          error: (error) => {
            console.error(`Error cancelling expired rental ${transaction.id}:`, error);
          }
        });
      }
    });
  }
  
  calculateStats(): void {
    this.totalRentals = this.transactions.length;
    this.activeRentals = this.transactions.filter(t => t.status === RentalStatus.APPROVED).length;
    this.pendingApprovals = this.transactions.filter(t => t.status === RentalStatus.PENDING).length;
    this.completedTransactions = this.transactions.filter(t => t.status === RentalStatus.COMPLETED).length;
    this.pendingTransactions = this.transactions.filter(t => t.status === RentalStatus.PENDING).length;
  }
  
  applyFilters(): void {
    const formValues = this.filterForm.value;
    let filtered = [...this.transactions];
    
    // Filter by status
    if (formValues.status !== 'all') {
      filtered = filtered.filter(t => t.status === formValues.status);
    }
    
    // Filter by date range
    if (formValues.dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      if (formValues.dateRange === 'month') {
        // Current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (formValues.dateRange === 'quarter') {
        // Current quarter
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
      } else if (formValues.dateRange === 'year') {
        // Current year
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= now;
      });
    }
    
    // Filter by property type (based on title for demo)
    if (formValues.propertyType !== 'all') {
      filtered = filtered.filter(t => 
        t.property.title.toLowerCase().includes(formValues.propertyType.toLowerCase())
      );
    }
    
    // Update filtered transactions
    this.filteredTransactions = filtered;
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      status: RentalStatus.PENDING,
      dateRange: 'all',
      propertyType: 'all'
    });
    
    // Only show PENDING transactions when resetting
    this.filteredTransactions = this.transactions.filter(t => t.status === RentalStatus.PENDING);
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
  
  getRentalDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const months = Math.floor(diffDays / 30);
    
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  renewRental(transactionId: string): void {
    if (confirm('Would you like to renew this rental agreement?')) {
      // In a real app, this would call a service to renew the rental
      alert(`Rental ${transactionId} renewal process initiated`);
    }
  }
  
  downloadAgreement(transactionId: string): void {
    // In a real app, this would call a service to generate and download the agreement
    alert(`Downloading rental agreement for transaction ${transactionId}`);
  }
  
  // Get property name even if title is missing
  getPropertyName(transaction: Transaction): string {
    if (transaction.property && transaction.property.title) {
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
            <h5 class="modal-title">Make Rental Payment</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Please confirm your payment details for <strong>${transaction.property.title || 'this property'}</strong>:</p>
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
        commissionFee: transaction.amount * 0.05, // 5% for rentals
        notes: notes,
        transactionStyle: TransactionStyle.RENT,
        agentId: ''
      };
      
      this.paymentService.processPayment(paymentRequest).subscribe({
        next: (response) => {
          // Update transaction status to COMPLETED or APPROVED based on current status
          if (transaction.id) {
            // For rentals, if it's PENDING we move to APPROVED, if already APPROVED we can set to COMPLETED
            const newStatus = transaction.status === RentalStatus.PENDING ? 
              RentalStatus.APPROVED : RentalStatus.COMPLETED;
            
            this.transactionService.updateRentalTransactionStatus(transaction.id.toString(), newStatus).subscribe({
              next: () => {
                closeModal();
                alert(`Payment processed successfully! Rental status updated to ${newStatus}.`);
                
                // Update the transaction in the local state
                this.transactions = this.transactions.map(t => {
                  if (t.id === transaction.id) {
                    return { ...t, status: newStatus, paymentStatus: 'paid' };
                  }
                  return t;
                });
                
                // Remove from filtered list if only showing PENDING
                if (this.filteredTransactions.every(t => t.status === RentalStatus.PENDING)) {
                  this.filteredTransactions = this.filteredTransactions.filter(t => t.id !== transaction.id);
                } else {
                  // Update in filtered list if showing all or the new status
                  this.filteredTransactions = this.filteredTransactions.map(t => {
                    if (t.id === transaction.id) {
                      return { ...t, status: newStatus, paymentStatus: 'paid' };
                    }
                    return t;
                  });
                }
                
                this.calculateStats();
              },
              error: (error) => {
                console.error('Failed to update rental status:', error);
                closeModal();
                alert('Payment processed but failed to update rental status. Please refresh the page.');
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
} 