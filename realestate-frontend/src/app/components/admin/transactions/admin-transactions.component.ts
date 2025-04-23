import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { Transaction } from '../../../models/transaction.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-transactions.component.html',
  styleUrls: ['./admin-transactions.component.scss']
})
export class AdminTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Filter controls
  searchControl = new FormControl('');
  typeFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  // Modal state
  showTransactionModal: boolean = false;
  selectedTransaction: Transaction | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadTransactions();
    
    // Setup search and filter listeners
    this.searchControl.valueChanges.subscribe(() => {
      this.filterTransactions();
    });
    
    this.typeFilter.valueChanges.subscribe(() => {
      this.filterTransactions();
    });
    
    this.statusFilter.valueChanges.subscribe(() => {
      this.filterTransactions();
    });
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.adminService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.filteredTransactions = [...transactions];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions';
        this.isLoading = false;
        console.error('Error loading transactions:', err);
      }
    });
  }
  
  filterTransactions(): void {
    let filtered = [...this.transactions];
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.propertyTitle.toLowerCase().includes(searchTerm) || 
        transaction.buyerName.toLowerCase().includes(searchTerm) ||
        transaction.sellerName.toLowerCase().includes(searchTerm) ||
        String(transaction.id).toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply type filter
    const typeValue = this.typeFilter.value;
    if (typeValue && typeValue !== 'all') {
      filtered = filtered.filter(transaction => transaction.transactionType === typeValue);
    }
    
    // Apply status filter
    const statusValue = this.statusFilter.value;
    if (statusValue && statusValue !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusValue);
    }
    
    this.filteredTransactions = filtered;
  }

  openTransactionModal(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.showTransactionModal = true;
  }
  
  closeTransactionModal(): void {
    this.selectedTransaction = null;
    this.showTransactionModal = false;
  }
  
  updateTransactionStatus(transaction: Transaction, status: 'pending' | 'completed' | 'cancelled' | 'refunded'): void {
    this.isLoading = true;
    this.adminService.updateTransactionStatus(transaction.id, status)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (updatedTransaction) => {
          // Update the transaction in the list
          const index = this.transactions.findIndex(t => t.id === updatedTransaction.id);
          if (index !== -1) {
            this.transactions[index] = updatedTransaction;
            this.filterTransactions(); // Re-apply filters to update the filtered list
          }
          this.closeTransactionModal();
        },
        error: (error) => {
          this.error = `Failed to update transaction status: ${error.message}`;
        }
      });
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'cancelled':
        return 'bg-danger';
      case 'refunded':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }
  
  getTypeBadgeClass(type: string): string {
    return type === 'sale' ? 'bg-primary' : 'bg-info';
  }
} 