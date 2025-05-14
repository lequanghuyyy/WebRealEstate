import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { TransactionStatus } from '../../models/transaction.model';
import { DefaultImageDirective } from '../../directives/default-image.directive';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, DefaultImageDirective]
})
export class BuyComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Stats
  totalTransactions: number = 0;
  completedTransactions: number = 0;
  pendingTransactions: number = 0;
  
  // Expose enum to the template
  transactionStatusEnum = TransactionStatus;
  
  constructor(
    private transactionService: TransactionService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadTransactions();
  }
  
  loadTransactions(): void {
    this.isLoading = true;
    
    // Use the specific method for buy transactions
    this.transactionService.getBuyTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.filteredTransactions = [...data];
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.errorMessage = 'Failed to load transaction data.';
        this.isLoading = false;
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
      this.filteredTransactions = this.transactions.filter(t => t.status === status);
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
    // Reset filters and show all transactions
    this.filteredTransactions = [...this.transactions];
    
    // Reset filter dropdowns to default if you have form controls
    const statusSelect = document.getElementById('status-filter') as HTMLSelectElement;
    const dateSelect = document.getElementById('date-filter') as HTMLSelectElement;
    const propertySelect = document.getElementById('property-filter') as HTMLSelectElement;
    
    if (statusSelect) statusSelect.value = 'all';
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
      // In a real app, this would call a service to cancel the transaction
      alert(`Transaction ${transactionId} has been cancelled`);
      
      // For demo purposes, update the local state
      this.transactions = this.transactions.map(t => {
        if (t.id === transactionId) {
          return { ...t, status: TransactionStatus.CANCELLED, paymentStatus: 'refunded' };
        }
        return t;
      });
      
      this.filteredTransactions = this.filteredTransactions.map(t => {
        if (t.id === transactionId) {
          return { ...t, status: TransactionStatus.CANCELLED, paymentStatus: 'refunded' };
        }
        return t;
      });
      
      // Update stats
      this.calculateStats();
    }
  }
}