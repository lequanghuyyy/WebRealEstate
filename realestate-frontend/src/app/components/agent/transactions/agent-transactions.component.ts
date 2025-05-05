import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { TransactionService, Transaction } from '../../../services/transaction.service';
import { TransactionDialogComponent } from '../../shared/transaction-dialog/transaction-dialog.component';

// Extended Transaction interface to include rent-specific fields
export interface ExtendedTransaction extends Transaction {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  notes?: string;
}

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
  transactions: ExtendedTransaction[] = [];
  filteredTransactions: ExtendedTransaction[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  agent: any = null;
  isAgent: boolean = true;
  
  // Active tab
  activeTab: 'buy' | 'rent' = 'buy';
  
  // Filters
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
  
  // Math object for template use
  Math = Math;

  // Filter form
  filterForm: FormGroup;
  
  // Transaction dialog properties
  showTransactionDialog: boolean = false;
  selectedTransaction: ExtendedTransaction | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      searchQuery: [''],
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

  // Change active tab
  changeTab(tab: 'buy' | 'rent'): void {
    this.activeTab = tab;
    this.currentPage = 1; // Reset to first page when changing tabs
  }

  loadTransactions(): void {
    this.isLoading = true;
    
    // Use the transaction service to get data
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions as ExtendedTransaction[];
        
        // Add mock start and end dates for rent transactions if not present
        this.transactions = this.transactions.map(t => {
          if (t.type === 'rent' && !t.startDate) {
            const date = new Date(t.date);
            const endDate = new Date(date);
            endDate.setMonth(endDate.getMonth() + 12); // 1 year lease by default
            
            return {
              ...t,
              startDate: t.date,
              endDate: endDate.toISOString().split('T')[0],
              paymentMethod: 'Bank Transfer',
              notes: 'Standard 1-year lease agreement'
            };
          } else if (t.type === 'sale' && !t.paymentMethod) {
            return {
              ...t,
              paymentMethod: 'Bank Transfer',
              notes: 'Standard sale agreement'
            };
          }
          return t;
        });
        
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
    const statusFilter = values.statusFilter;
    const paymentStatusFilter = values.paymentStatusFilter;
    
    this.filteredTransactions = this.transactions.filter(transaction => {
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

  // Get filtered transactions based on current tab
  getFilteredTransactionsByType(): ExtendedTransaction[] {
    return this.filteredTransactions.filter(t => 
      this.activeTab === 'buy' ? t.type === 'sale' : t.type === 'rent'
    );
  }

  // Get filtered sale transactions
  getFilteredSaleTransactions(): ExtendedTransaction[] {
    return this.filteredTransactions.filter(t => t.type === 'sale');
  }

  // Get filtered rental transactions
  getFilteredRentalTransactions(): ExtendedTransaction[] {
    return this.filteredTransactions.filter(t => t.type === 'rent');
  }

  // Get paginated transactions for the current tab
  getPaginatedSaleTransactions(): ExtendedTransaction[] {
    const filtered = this.getFilteredSaleTransactions();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  // Get paginated rental transactions
  getPaginatedRentalTransactions(): ExtendedTransaction[] {
    const filtered = this.getFilteredRentalTransactions();
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.getTotalPages()) {
      this.currentPage = newPage;
    }
  }

  getFormattedCurrency(amount: number): string {
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
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  // Get count of sale transactions
  getSaleTransactionsCount(): number {
    return this.transactions.filter(t => t.type === 'sale').length;
  }
  
  // Get count of rental transactions
  getRentalTransactionsCount(): number {
    return this.transactions.filter(t => t.type === 'rent').length;
  }
  
  // Get total pages for current tab
  getTotalPages(): number {
    const count = this.getFilteredTransactionsByType().length;
    return Math.ceil(count / this.pageSize);
  }
  
  // Get array of page numbers for pagination
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  // Get starting index of current page
  getCurrentPageStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }
  
  // Get ending index of current page
  getCurrentPageEnd(): number {
    const end = this.currentPage * this.pageSize;
    const total = this.getFilteredTransactionsByType().length;
    return Math.min(end, total);
  }

  // View transaction details in modal
  viewTransactionDetails(transaction: ExtendedTransaction): void {
    this.selectedTransaction = transaction;
    
    // Open modal using Bootstrap
    const modal = document.getElementById('transactionDetailsModal');
    if (modal) {
      // @ts-ignore
      const bsModal = new window.bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  openAddTransactionDialog(): void {
    this.selectedTransaction = null;
    this.showTransactionDialog = true;
  }

  openEditTransactionDialog(transaction: ExtendedTransaction): void {
    this.selectedTransaction = transaction;
    this.showTransactionDialog = true;
  }

  handleSaveTransaction(transactionData: Partial<ExtendedTransaction>): void {
    this.showTransactionDialog = false;
    
    if (!transactionData) return;
    
    if (this.selectedTransaction) {
      // Update existing transaction
      const updatedTransaction = {
        ...this.selectedTransaction,
        ...transactionData
      };
      
      this.transactionService.updateTransaction(updatedTransaction as Transaction).subscribe({
        next: (updated) => {
          const index = this.transactions.findIndex(t => t.id === updated.id);
          if (index !== -1) {
            this.transactions[index] = updated as ExtendedTransaction;
            this.applyFilters();
            this.calculateSummary();
          }
        },
        error: (error) => {
          console.error('Error updating transaction:', error);
          alert('Failed to update transaction. Please try again.');
        }
      });
    } else {
      // Add new transaction
      this.transactionService.addTransaction(transactionData as Transaction).subscribe({
        next: (newTransaction) => {
          this.transactions.push(newTransaction as ExtendedTransaction);
          this.applyFilters();
          this.calculateSummary();
        },
        error: (error) => {
          console.error('Error adding transaction:', error);
          alert('Failed to add transaction. Please try again.');
        }
      });
    }
  }

  deleteTransaction(transaction: ExtendedTransaction): void {
    const confirmDelete = confirm(`Are you sure you want to delete transaction #${transaction.id}?`);
    
    if (confirmDelete) {
      this.transactionService.deleteTransaction(transaction.id as string).subscribe({
        next: (success) => {
          if (success) {
            this.transactions = this.transactions.filter(t => t.id !== transaction.id);
            this.applyFilters();
            this.calculateSummary();
          } else {
            alert('Failed to delete transaction. Please try again.');
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