import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { Transaction, TransactionStatus, RentalStatus, 
         SalesTransactionResponse, RentalTransactionResponse,
         PageSalesTransactionRequest, PageRentalTransactionRequest, 
         PageDto } from '../../../models/transaction.model';
import { finalize, forkJoin } from 'rxjs';
import { TransactionService } from '../../../services/transaction.service';
import { PropertyService } from '../../../services/property.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './admin-transactions.component.html',
  styleUrls: ['./admin-transactions.component.scss']
})
export class AdminTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  salesTransactions: SalesTransactionResponse[] = [];
  rentalTransactions: RentalTransactionResponse[] = [];
  
  isLoading: boolean = true;
  error: string | null = null;
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Filter controls
  searchControl = new FormControl('');
  typeFilter = new FormControl('all');
  statusFilter = new FormControl('all');
  
  // Modal state
  showTransactionModal: boolean = false;
  selectedTransaction: any = null;
  isRentalTransaction: boolean = false;

  constructor(
    private adminService: AdminService,
    private transactionService: TransactionService,
    private propertyService: PropertyService,
    private userService: UserService
  ) {}

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
    this.error = null;
    
    // Create requests with pagination
    const salesRequest: PageSalesTransactionRequest = {
      page: this.currentPage,
      size: this.pageSize
    };
    
    const rentalRequest: PageRentalTransactionRequest = {
      page: this.currentPage,
      size: this.pageSize
    };
    
    console.log('Loading transactions with page:', this.currentPage, 'size:', this.pageSize);
    
    // Use forkJoin to make parallel requests
    forkJoin({
      sales: this.transactionService.getAllSalesTransactions(salesRequest),
      rentals: this.transactionService.getAllRentalTransactions(rentalRequest)
    }).subscribe({
      next: (results) => {
        console.log('Received sales data:', results.sales);
        console.log('Received rentals data:', results.rentals);
        
        // Store the original response data
        this.salesTransactions = results.sales.items;
        this.rentalTransactions = results.rentals.items;
        
        // Calculate total items from both sources
        this.totalItems = results.sales.totalElements + results.rentals.totalElements;
        this.totalPages = Math.max(results.sales.totalPages, results.rentals.totalPages);
        
        // Transform both types to a common Transaction format
        const salesTransformed = this.salesTransactions.map(sale => this.mapSaleTransaction(sale));
        const rentalsTransformed = this.rentalTransactions.map(rental => this.mapRentalTransaction(rental));
        
        // Combine and sort by date (newest first)
        this.transactions = [...salesTransformed, ...rentalsTransformed]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        this.filteredTransactions = [...this.transactions];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions';
        this.isLoading = false;
        console.error('Error loading transactions:', err);
      }
    });
  }
  
  mapSaleTransaction(sale: SalesTransactionResponse): Transaction {
    return {
      id: sale.id,
      type: 'sale',
      transactionType: 'sale',
      propertyId: sale.listingId,
      propertyTitle: `Property ID: ${sale.listingId}`,
      amount: Number(sale.amount),
      status: sale.transactionStatus,
      paymentStatus: sale.transactionStatus,
      date: sale.createdAt,
      buyerId: sale.buyerId,
      buyerName: `Customer ID: ${sale.buyerId}`,
      agentId: sale.agentId,
      property: {
        id: sale.listingId,
        title: `Property ID: ${sale.listingId}`
      },
      client: {
        name: `Customer ID: ${sale.buyerId}`,
        email: ''
      }
    };
  }
  
  mapRentalTransaction(rental: RentalTransactionResponse): Transaction {
    return {
      id: rental.id,
      type: 'rent',
      transactionType: 'rent',
      propertyId: rental.listingId,
      propertyTitle: `Property ID: ${rental.listingId}`,
      amount: Number(rental.monthlyRent),
      status: rental.status,
      paymentStatus: rental.status,
      date: rental.createdAt,
      buyerId: rental.renterId,
      buyerName: `Customer ID: ${rental.renterId}`,
      agentId: rental.agentId,
      startDate: rental.startDate,
      endDate: rental.endDate,
      property: {
        id: rental.listingId,
        title: `Property ID: ${rental.listingId}`
      },
      client: {
        name: `Customer ID: ${rental.renterId}`,
        email: ''
      }
    };
  }
  
  filterTransactions(): void {
    let filtered = [...this.transactions];
    
    // Apply search filter
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        (transaction.propertyTitle?.toLowerCase().includes(searchTerm) || false) || 
        (transaction.buyerName?.toLowerCase().includes(searchTerm) || false) ||
        (String(transaction.id).toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply type filter
    const typeValue = this.typeFilter.value;
    if (typeValue && typeValue !== 'all') {
      filtered = filtered.filter(transaction => transaction.transactionType === typeValue || transaction.type === typeValue);
    }
    
    // Apply status filter
    const statusValue = this.statusFilter.value;
    if (statusValue && statusValue !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusValue);
    }
    
    this.filteredTransactions = filtered;
  }

  openTransactionModal(transaction: Transaction): void {
    this.isLoading = true;
    this.selectedTransaction = null;
    
    // Determine if this is a rental or sales transaction
    this.isRentalTransaction = transaction.type === 'rent' || transaction.transactionType === 'rent';
    
    // Fetch detailed transaction data
    if (this.isRentalTransaction) {
      this.transactionService.getRentalTransactionById(transaction.id!.toString())
        .subscribe({
          next: (rental) => {
            this.selectedTransaction = rental;
            
            // Fetch property title using listing ID
            this.fetchPropertyTitle(rental.listingId);
            
            // Fetch renter name using renter ID
            this.fetchUserName(rental.renterId, 'renter');
            
            this.showTransactionModal = true;
            this.isLoading = false;
          },
          error: (err) => {
            this.error = 'Failed to load transaction details';
            this.isLoading = false;
          }
        });
    } else {
      this.transactionService.getSalesTransactionById(transaction.id!.toString())
        .subscribe({
          next: (sale) => {
            this.selectedTransaction = sale;
            
            // Fetch property title using listing ID
            this.fetchPropertyTitle(sale.listingId);
            
            // Fetch buyer name using buyer ID
            this.fetchUserName(sale.buyerId, 'buyer');
            
            this.showTransactionModal = true;
            this.isLoading = false;
          },
          error: (err) => {
            this.error = 'Failed to load transaction details';
            this.isLoading = false;
          }
        });
    }
  }
  
  closeTransactionModal(): void {
    this.selectedTransaction = null;
    this.showTransactionModal = false;
  }
  
  updateTransactionStatus(transaction: Transaction, status: string): void {
    if (!transaction.id) {
      this.error = "Cannot update transaction without an ID";
      return;
    }
    
    this.isLoading = true;
    
    // Determine if this is a rental or sales transaction
    const isRental = transaction.type === 'rent' || transaction.transactionType === 'rent';
    
    if (isRental) {
      this.transactionService.updateRentalTransactionStatus(transaction.id.toString(), status)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.loadTransactions(); // Reload all transactions to get updated data
            this.closeTransactionModal();
          },
          error: (error) => {
            this.error = `Failed to update transaction status: ${error.message}`;
          }
        });
    } else {
      this.transactionService.updateSalesTransactionStatus(transaction.id.toString(), status)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.loadTransactions(); // Reload all transactions to get updated data
            this.closeTransactionModal();
          },
          error: (error) => {
            this.error = `Failed to update transaction status: ${error.message}`;
          }
        });
    }
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }
  
  onPageSizeChange(): void {
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadTransactions();
  }
  
  formatCurrency(amount: number): string {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }
  
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  getStatusBadgeClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';
    
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'bg-status-completed';
      case 'PENDING':
        return 'bg-status-pending';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-status-cancelled';
      default:
        return 'bg-secondary';
    }
  }
  
  getTypeBadgeClass(type: string | undefined): string {
    if (!type) return 'bg-secondary';
    return (type.toLowerCase() === 'sale') ? 'bg-primary' : 'bg-info';
  }

  // Calculate lease duration in months/years
  calculateLeaseDuration(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) {
      return 'N/A';
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate the difference in months
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
      }
    }
  }

  // Method to fetch property title
  fetchPropertyTitle(listingId: string): void {
    this.propertyService.getPropertyById(listingId).subscribe({
      next: (property: any) => {
        if (this.selectedTransaction) {
          this.selectedTransaction.propertyTitle = property.title;
        }
      },
      error: (err: any) => {
        console.error('Error fetching property:', err);
      }
    });
  }

  // Method to fetch user name
  fetchUserName(userId: string, userType: 'buyer' | 'renter'): void {
    this.userService.getUserById(userId).subscribe({
      next: (user: any) => {
        if (this.selectedTransaction) {
          const fullName = `${user.firstName} ${user.lastName}`;
          if (userType === 'buyer') {
            this.selectedTransaction.buyerName = fullName;
          } else {
            this.selectedTransaction.renterName = fullName;
          }
        }
      },
      error: (err: any) => {
        console.error(`Error fetching ${userType}:`, err);
      }
    });
  }
} 