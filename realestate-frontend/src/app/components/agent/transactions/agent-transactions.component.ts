import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { TransactionService, Transaction } from '../../../services/transaction.service';
import { TransactionDialogComponent } from '../../shared/transaction-dialog/transaction-dialog.component';

@Component({
  selector: 'app-agent-transactions',
  templateUrl: './agent-transactions.component.html',
  styleUrls: ['./agent-transactions.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule,
    TransactionDialogComponent
  ]
})
export class AgentTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  agent: any = null;
  isAgent: boolean = true;
  
  // Filters
  filterType: string = 'ALL';
  filterTransactionStatus: string = 'ALL';
  filterPaymentStatus: string = 'ALL';
  searchQuery: string = '';
  
  // Sort options
  sortField: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Summary data
  totalCommission: number = 0;
  pendingCommission: number = 0;
  totalTransactions: number = 0;
  successfulTransactions: number = 0;

  // Pagination
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  
  // Math object for template use
  Math = Math;

  // Filter form
  filterForm: FormGroup;
  
  // Transaction dialog properties
  showTransactionDialog: boolean = false;
  selectedTransaction: Transaction | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      typeFilter: ['all'],
      statusFilter: ['all'],
      paymentStatusFilter: ['all']
    });
  }

  ngOnInit(): void {
    // Check if user is an agent
    if (!this.authService.isAgent()) {
      this.isAgent = false;
      return;
    }
    
    // Get agent data
    this.agent = this.authService.getCurrentUser();
    
    // Load transactions data
    this.loadTransactions();
    
    // Listen for filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadTransactions(): void {
    this.isLoading = true;
    
    // Use the transaction service to get data
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.applyFilters();
        this.calculateSummary();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.errorMessage = 'Failed to load transactions. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const values = this.filterForm.value;
    this.searchQuery = values.searchQuery || '';
    const typeFilter = values.typeFilter;
    const statusFilter = values.statusFilter;
    const paymentStatusFilter = values.paymentStatusFilter;
    
    this.filteredTransactions = this.transactions.filter(transaction => {
      // Type filter
      if (typeFilter !== 'all' && transaction.type !== typeFilter) {
        return false;
      }
      
      // Transaction status filter
      if (statusFilter !== 'all' && transaction.status !== statusFilter) {
        return false;
      }
      
      // Payment status filter
      if (paymentStatusFilter !== 'all' && transaction.paymentStatus !== paymentStatusFilter) {
        return false;
      }
      
      // Search query filter
      if (this.searchQuery.trim() !== '') {
        const searchLower = this.searchQuery.toLowerCase();
        return (
          String(transaction.id || '').toLowerCase().includes(searchLower) ||
          transaction.property.title.toLowerCase().includes(searchLower) ||
          transaction.client.name.toLowerCase().includes(searchLower) ||
          transaction.client.email.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
    
    // Apply sorting
    this.sortTransactions();
    
    // Update total pages
    this.totalPages = Math.ceil(this.filteredTransactions.length / this.pageSize);
    
    // Reset to first page if current page is now invalid
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }
  
  sortTransactions(): void {
    this.filteredTransactions.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Determine which field to sort by
      switch (this.sortField) {
        case 'id':
          valueA = a.id;
          valueB = b.id;
          break;
        case 'property':
          valueA = a.property.title;
          valueB = b.property.title;
          break;
        case 'client':
          valueA = a.client.name;
          valueB = b.client.name;
          break;
        case 'amount':
          valueA = a.amount;
          valueB = b.amount;
          break;
        case 'commission':
          valueA = a.commission;
          valueB = b.commission;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'paymentStatus':
          valueA = a.paymentStatus;
          valueB = b.paymentStatus;
          break;
        case 'date':
        default:
          valueA = new Date(a.date).getTime();
          valueB = new Date(b.date).getTime();
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
      // New field, default to ascending
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.sortTransactions();
  }

  resetFilters(): void {
    this.filterForm.setValue({
      searchQuery: '',
      typeFilter: 'all',
      statusFilter: 'all',
      paymentStatusFilter: 'all'
    });
  }

  calculateSummary(): void {
    this.totalTransactions = this.transactions.length;
    this.successfulTransactions = this.transactions.filter(
      t => t.status === 'completed'
    ).length;
    
    this.totalCommission = this.transactions.reduce(
      (sum, t) => t.paymentStatus === 'paid' ? sum + t.commission : sum, 0
    );
    
    this.pendingCommission = this.transactions.reduce(
      (sum, t) => t.paymentStatus === 'pending' ? sum + t.commission : sum, 0
    );
  }

  changePage(newPage: number): void {
    if (newPage > 0 && newPage <= this.totalPages) {
      this.currentPage = newPage;
    }
  }

  getFormattedCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getDateFormatted(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPaginatedTransactions(): Transaction[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTransactions.slice(start, start + this.pageSize);
  }
  
  // Add a new transaction
  openAddTransactionDialog(): void {
    this.selectedTransaction = null;
    this.showTransactionDialog = true;
  }
  
  // Edit an existing transaction
  openEditTransactionDialog(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.showTransactionDialog = true;
  }
  
  // Handle transaction save from dialog
  handleSaveTransaction(transactionData: Partial<Transaction>): void {
    if (transactionData.id) {
      // Editing existing transaction
      this.transactionService.updateTransaction(transactionData as Transaction).subscribe({
        next: (updatedTransaction) => {
          // Update in local array
          const index = this.transactions.findIndex(t => t.id === updatedTransaction.id);
          if (index !== -1) {
            this.transactions[index] = updatedTransaction;
          }
          this.applyFilters();
          this.calculateSummary();
        },
        error: (error) => {
          console.error('Error updating transaction:', error);
          // Show error notification
          alert('Failed to update transaction. Please try again.');
        }
      });
    } else {
      // Adding new transaction
      this.transactionService.addTransaction(transactionData as Omit<Transaction, 'id'>).subscribe({
        next: (newTransaction) => {
          // Add to local array
          this.transactions.push(newTransaction);
          this.applyFilters();
          this.calculateSummary();
        },
        error: (error) => {
          console.error('Error adding transaction:', error);
          // Show error notification
          alert('Failed to add transaction. Please try again.');
        }
      });
    }
  }
  
  // Delete a transaction
  deleteTransaction(transaction: Transaction): void {
    if (confirm(`Are you sure you want to delete transaction ${transaction.id}?`)) {
      this.transactionService.deleteTransaction(String(transaction.id)).subscribe({
        next: (success) => {
          if (success) {
            // Remove from local array
            this.transactions = this.transactions.filter(t => t.id !== transaction.id);
            this.applyFilters();
            this.calculateSummary();
          } else {
            alert('Could not delete transaction. Please try again.');
          }
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
          alert('Failed to delete transaction. Please try again.');
        }
      });
    }
  }
} 