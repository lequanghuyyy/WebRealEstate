import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ListingService } from '../../../services/listing.service';
import { ToastrWrapperService } from '../../../services/toastr-wrapper.service';
import { TransactionService } from '../../../services/transaction.service';
import { 
  ListingResponse, 
  ListingType, 
  ListingStatus, 
  ListingStatusUpdateRequest,
  ListingPropertyType,
  PageDto 
} from '../../../models/listing.model';
import { 
  RentalStatus,
  RentalTransactionResponse, 
  RentalTransactionRequest 
} from '../../../models/transaction.model';

@Component({
  selector: 'app-agent-rent',
  templateUrl: './agent-rent.component.html',
  styleUrls: ['./agent-rent.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule]
})
export class AgentRentComponent implements OnInit {
  // Properties
  listings: ListingResponse[] = [];
  filteredListings: ListingResponse[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Current agent
  agentId: string | null = null;
  
  // Active tab
  activeTab: 'listings' | 'requests' | 'rentals' = 'listings';
  
  // Listing stats
  activeListings: number = 0;
  pendingListings: number = 0;
  rentedListings: number = 0;
  
  // Rental requests stats
  pendingRequests: number = 0;
  
  // Active rentals stats
  activeRentals: number = 0;
  
  // Filter options
  searchQuery: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'newest';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Rental requests
  rentalRequests: any[] = [];
  filteredRequests: any[] = [];
  
  // Active rentals
  activeRentalsList: any[] = [];
  filteredRentals: any[] = [];

  // Rental transactions
  rentalTransactions: RentalTransactionResponse[] = [];
  
  constructor(
    private authService: AuthService,
    private listingService: ListingService,
    private transactionService: TransactionService,
    private toastr: ToastrWrapperService
  ) {}
  
  ngOnInit(): void {
    // Check if user is logged in and is an agent
    if (!this.authService.isLoggedIn() || !this.authService.isAgent()) {
      this.error = 'You must be logged in as an agent to access this page.';
      this.isLoading = false;
      return;
    }
    
    // Get current agent ID
    const user = this.authService.getCurrentUser();
    if (user) {
      this.agentId = user.id;
      this.loadRentalListings();
      this.loadRentalRequests();
      this.loadActiveRentals();
      this.loadRentalTransactions();
    } else {
      this.error = 'Unable to retrieve agent information.';
      this.isLoading = false;
    }
  }
  
  loadRentalListings(): void {
    this.isLoading = true;
    console.log(`Loading rental listings for agent ${this.agentId}, page ${this.currentPage}, size ${this.pageSize}`);
    
    if (this.agentId) {
      // Use paged endpoint for rent listings
      this.listingService.getListingsByRentTypePaged(this.currentPage, this.pageSize).subscribe({
        next: (pageData: PageDto<ListingResponse>) => {
          console.log('Loaded rental listings response:', pageData);
          
          // Get total counts directly from the PageDto response
          this.totalItems = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          
          // Filter listings that belong to the current agent
          this.listings = pageData.items.filter(item => item.ownerId === this.agentId);
          console.log(`Found ${this.listings.length} rental listings for agent ${this.agentId} out of ${pageData.items.length} total`);
          
          this.applyFilters();
          this.calculateStats();
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading rental listings:', err);
          this.error = 'Failed to load your listings. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }
  
  loadRentalRequests(): void {
    if (this.agentId) {
      this.listingService.getRentalRequests(this.agentId).subscribe({
        next: (requests) => {
          this.rentalRequests = requests;
          this.filteredRequests = [...requests];
          this.pendingRequests = requests.filter(req => req.status === 'PENDING').length;
        },
        error: (err: any) => {
          console.error('Error loading rental requests:', err);
        }
      });
    }
  }
  
  loadActiveRentals(): void {
    if (this.agentId) {
      this.listingService.getActiveRentals(this.agentId).subscribe({
        next: (rentals) => {
          this.activeRentalsList = rentals;
          this.filteredRentals = [...rentals];
          this.activeRentals = rentals.length;
        },
        error: (err: any) => {
          console.error('Error loading active rentals:', err);
        }
      });
    }
  }

  loadRentalTransactions(): void {
    if (this.agentId) {
      this.transactionService.getRentalTransactionsByAgent(this.agentId).subscribe({
        next: (transactions) => {
          this.rentalTransactions = transactions;
          console.log('Loaded rental transactions:', transactions);
        },
        error: (err) => {
          console.error('Error loading rental transactions:', err);
        }
      });
    }
  }
  
  applyFilters(): void {
    // Start with all listings
    let result = [...this.listings];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      result = result.filter(listing => 
        listing.status.toLowerCase() === this.statusFilter.toLowerCase()
      );
    }
    
    // Apply search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.address.toLowerCase().includes(query) ||
        listing.city.toLowerCase().includes(query) ||
        listing.id.toString().includes(query)
      );
    }
    
    // Apply sorting
    switch (this.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'views':
        result.sort((a, b) => (b.view || 0) - (a.view || 0));
        break;
    }
    
    this.filteredListings = result;
  }
  
  calculateStats(): void {
    this.activeListings = this.listings.filter(l => l.status === ListingStatus.AVAILABLE).length;
    this.pendingListings = this.listings.filter(l => l.status === ListingStatus.PENDING).length;
    this.rentedListings = this.listings.filter(l => l.status === ListingStatus.RENTED).length;
  }
  
  changeTab(tab: 'listings' | 'requests' | 'rentals'): void {
    this.activeTab = tab;
  }
  
  changePage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRentalListings();
    }
  }
  
  updateStatusFilter(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }
  
  updateSort(sort: string): void {
    this.sortBy = sort;
    this.applyFilters();
  }
  
  search(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case ListingStatus.AVAILABLE:
        return 'status-available';
      case ListingStatus.PENDING:
        return 'status-pending';
      case ListingStatus.RENTED:
        return 'status-rented';
      case ListingStatus.SOLD:
        return 'status-sold';
      case ListingStatus.DELISTED:
        return 'status-delisted';
      default:
        return '';
    }
  }
  
  createNewListing(): void {
    // Navigate to create listing page
    window.location.href = '/agent/create-listing?type=RENT';
  }
  
  editListing(id: string): void {
    window.location.href = `/agent/edit-listing/${id}`;
  }
  
  markAsRented(id: string): void {
    if (confirm('Are you sure you want to mark this listing as rented?')) {
      const statusRequest: ListingStatusUpdateRequest = { 
        status: ListingStatus.RENTED 
      };
      
      this.listingService.updateListingStatus(id, statusRequest).subscribe({
        next: () => {
          // Update the local list
          const index = this.listings.findIndex(l => l.id === id);
          if (index !== -1) {
            this.listings[index].status = ListingStatus.RENTED;
            this.applyFilters();
            this.calculateStats();
          }
          this.toastr.success('Listing has been marked as rented');

          // Create a rental transaction if needed
          this.createRentalTransaction(id);
        },
        error: (err: any) => {
          console.error('Error updating listing status:', err);
          this.toastr.error('Failed to update listing status');
        }
      });
    }
  }

  createRentalTransaction(listingId: string): void {
    // Check if a transaction for this listing already exists
    const existingTransaction = this.rentalTransactions.find(t => t.listingId === listingId);
    if (existingTransaction) {
      // Update the transaction status if needed
      if (existingTransaction.status !== RentalStatus.APPROVED) {
        this.updateRentalTransactionStatus(existingTransaction.id, RentalStatus.APPROVED);
      }
      return;
    }

    // Get the listing details
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing || !this.agentId) return;

    // Here we would typically have renter information
    // For now, we'll just use a placeholder or prompt for renter ID
    const renterId = prompt('Enter the renter ID:', '');
    if (!renterId) return;

    const rentalTransaction: RentalTransactionRequest = {
      listingId: listingId,
      renterId: renterId,
      agentId: this.agentId,
      status: RentalStatus.APPROVED,
      monthlyRent: listing.price,
      deposit: listing.price * 2, // Example: 2 months deposit
      startDate: new Date().toISOString().split('T')[0], // Today
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] // 1 year from now
    };

    this.transactionService.createRentalTransaction(rentalTransaction).subscribe({
      next: (response) => {
        console.log('Created rental transaction:', response);
        this.toastr.success('Rental transaction created successfully');
        this.loadRentalTransactions();
      },
      error: (err) => {
        console.error('Error creating rental transaction:', err);
        this.toastr.error('Failed to create rental transaction');
      }
    });
  }

  updateRentalTransactionStatus(transactionId: string, status: string): void {
    this.transactionService.updateRentalTransactionStatus(transactionId, status).subscribe({
      next: (response) => {
        console.log('Updated rental transaction status:', response);
        this.toastr.success('Rental transaction status updated successfully');
        this.loadRentalTransactions();
      },
      error: (err) => {
        console.error('Error updating rental transaction status:', err);
        this.toastr.error('Failed to update rental transaction status');
      }
    });
  }
  
  markAsAvailable(id: string): void {
    const statusRequest: ListingStatusUpdateRequest = { 
      status: ListingStatus.AVAILABLE 
    };
    
    this.listingService.updateListingStatus(id, statusRequest).subscribe({
      next: () => {
        // Update the local list
        const index = this.listings.findIndex(l => l.id === id);
        if (index !== -1) {
          this.listings[index].status = ListingStatus.AVAILABLE;
          this.applyFilters();
          this.calculateStats();
        }
        this.toastr.success('Listing is now available');
      },
      error: (err: any) => {
        console.error('Error updating listing status:', err);
        this.toastr.error('Failed to update listing status');
      }
    });
  }
  
  deleteListing(id: string): void {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.listingService.deleteListing(id).subscribe({
        next: () => {
          // Remove from local list
          this.listings = this.listings.filter(l => l.id !== id);
          this.applyFilters();
          this.calculateStats();
          this.toastr.success('Listing has been deleted');
        },
        error: (err: any) => {
          console.error('Error deleting listing:', err);
          this.toastr.error('Failed to delete listing');
        }
      });
    }
  }
  
  approveRentalRequest(requestId: string): void {
    this.listingService.approveRentalRequest(requestId).subscribe({
      next: (response) => {
        this.toastr.success('Rental request approved');
        this.loadRentalRequests();
        this.loadActiveRentals();

        // Create or update rental transaction
        if (response && response.listingId) {
          this.createRentalTransaction(response.listingId);
        }
      },
      error: (err: any) => {
        console.error('Error approving rental request:', err);
        this.toastr.error('Failed to approve rental request');
      }
    });
  }
  
  rejectRentalRequest(requestId: string): void {
    this.listingService.rejectRentalRequest(requestId).subscribe({
      next: (response) => {
        this.toastr.success('Rental request rejected');
        this.loadRentalRequests();

        // Update transaction status if exists
        if (response && response.listingId) {
          const transaction = this.rentalTransactions.find(t => t.listingId === response.listingId);
          if (transaction) {
            this.updateRentalTransactionStatus(transaction.id, RentalStatus.REJECTED);
          }
        }
      },
      error: (err: any) => {
        console.error('Error rejecting rental request:', err);
        this.toastr.error('Failed to reject rental request');
      }
    });
  }
  
  completeRental(rentalId: string): void {
    this.listingService.completeRental(rentalId).subscribe({
      next: (response) => {
        this.toastr.success('Rental completed');
        this.loadActiveRentals();

        // Update transaction status
        if (response && response.listingId) {
          const transaction = this.rentalTransactions.find(t => t.listingId === response.listingId);
          if (transaction) {
            this.updateRentalTransactionStatus(transaction.id, RentalStatus.COMPLETED);
          }
        }
      },
      error: (err: any) => {
        console.error('Error completing rental:', err);
        this.toastr.error('Failed to complete rental');
      }
    });
  }
  
  cancelRental(rentalId: string): void {
    this.listingService.cancelRental(rentalId).subscribe({
      next: (response) => {
        this.toastr.success('Rental cancelled');
        this.loadActiveRentals();

        // Update transaction status
        if (response && response.listingId) {
          const transaction = this.rentalTransactions.find(t => t.listingId === response.listingId);
          if (transaction) {
            this.updateRentalTransactionStatus(transaction.id, RentalStatus.CANCELLED);
          }
        }
      },
      error: (err: any) => {
        console.error('Error cancelling rental:', err);
        this.toastr.error('Failed to cancel rental');
      }
    });
  }
} 