import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ListingService } from '../../../services/listing.service';
import { ToastrWrapperService } from '../../../services/toastr-wrapper.service';
import { TransactionService } from '../../../services/transaction.service';
import { DefaultImageDirective } from '../../../directives/default-image.directive';
import { 
  ListingResponse, 
  ListingType, 
  ListingStatus, 
  ListingStatusUpdateRequest,
  ListingPropertyType,
  PageDto,
  ListingImageResponse
} from '../../../models/listing.model';
import { 
  TransactionStatus,
  SalesTransactionRequest,
  SalesTransactionResponse 
} from '../../../models/transaction.model';

@Component({
  selector: 'app-agent-buy',
  templateUrl: './agent-buy.component.html',
  styleUrls: ['./agent-buy.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, DefaultImageDirective]
})
export class AgentBuyComponent implements OnInit {
  // Properties
  listings: ListingResponse[] = [];
  filteredListings: ListingResponse[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Current agent
  agentId: string | null = null;
  
  // Listing stats
  activeListings: number = 0;
  pendingListings: number = 0;
  soldListings: number = 0;
  
  // Filter options
  searchQuery: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'newest';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Sales transactions
  salesTransactions: SalesTransactionResponse[] = [];

  // Default image path
  defaultImage: string = 'assets/images/placeholder-property.jpg';
  
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
      this.loadSaleListings();
      this.loadSalesTransactions();
    } else {
      this.error = 'Unable to retrieve agent information.';
      this.isLoading = false;
    }
  }
  
  loadSaleListings(): void {
    this.isLoading = true;
    console.log(`Loading sale listings for agent ${this.agentId}, page ${this.currentPage}, size ${this.pageSize}`);
    
    if (this.agentId) {
      // Use paged endpoint for sale listings
      this.listingService.getListingsBySaleTypePaged(this.currentPage, this.pageSize).subscribe({
        next: (pageData: PageDto<ListingResponse>) => {
          console.log('Loaded sale listings response:', pageData);
          
          // Get total counts directly from the PageDto response
          this.totalItems = pageData.totalElements;
          this.totalPages = pageData.totalPages;
          
          // Filter listings that belong to the current agent
          this.listings = pageData.items.filter(item => item.ownerId === this.agentId);
          console.log(`Found ${this.listings.length} sale listings for agent ${this.agentId} out of ${pageData.items.length} total`);
          
          // Fetch images for each listing
          this.loadListingImages();
          
          this.applyFilters();
          this.calculateStats();
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading sale listings:', err);
          this.error = 'Failed to load your listings. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  loadListingImages(): void {
    // For each listing, try to get main image
    this.listings.forEach(listing => {
      // Nếu listing có sẵn mainURL thì sử dụng luôn
      if (listing.mainURL) {
        listing.image = listing.mainURL;
      }
      // Nếu không có mainURL nhưng có images array
      else if (listing.images && listing.images.length > 0) {
        // Kiểm tra xem images là mảng chuỗi hay mảng object
        if (typeof listing.images[0] === 'string') {
          listing.image = listing.images[0];
        } else if (listing.images[0].hasOwnProperty('imageUrl')) {
          listing.image = listing.images[0].imageUrl;
        }
      }
      // Trường hợp không có cả mainURL và images, gọi API để lấy ảnh
      else if (!listing.image && listing.id) {
        this.listingService.getMainImageUrl(listing.id).subscribe({
          next: (imageUrl: string) => {
            if (imageUrl) {
              listing.image = imageUrl;
            }
          },
          error: (err) => {
            console.error(`Error loading main image for listing ${listing.id}:`, err);
            // Use default image in case of error - already handled by directive
          }
        });
      }
    });
  }

  loadSalesTransactions(): void {
    if (this.agentId) {
      this.transactionService.getSalesTransactionsByAgent(this.agentId).subscribe({
        next: (transactions) => {
          this.salesTransactions = transactions;
          console.log('Loaded sales transactions:', transactions);
        },
        error: (err) => {
          console.error('Error loading sales transactions:', err);
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
        listing.status?.toLowerCase() === this.statusFilter.toLowerCase() ||
        listing.listingStatus?.toLowerCase() === this.statusFilter.toLowerCase()
      );
    } else {
      // Nếu không có filter nào được chọn, mặc định chỉ hiển thị các listing có status AVAILABLE
      result = result.filter(listing => 
        listing.status === ListingStatus.AVAILABLE || 
        listing.listingStatus === ListingStatus.AVAILABLE
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
    this.activeListings = this.listings.filter(l => 
      l.status === ListingStatus.AVAILABLE || 
      l.listingStatus === ListingStatus.AVAILABLE
    ).length;
    
    this.pendingListings = this.listings.filter(l => 
      l.status === ListingStatus.PENDING || 
      l.listingStatus === ListingStatus.PENDING
    ).length;
    
    this.soldListings = this.listings.filter(l => 
      l.status === ListingStatus.SOLD || 
      l.listingStatus === ListingStatus.SOLD
    ).length;
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
    // Nếu status là null hoặc undefined, trả về rỗng
    if (!status) {
      return '';
    }
    
    switch (status) {
      case ListingStatus.AVAILABLE:
        return 'status-available';
      case ListingStatus.PENDING:
        return 'status-pending';
      case ListingStatus.SOLD:
        return 'status-sold';
      case ListingStatus.RENTED:
        return 'status-rented';
      case ListingStatus.DELISTED:
        return 'status-delisted';
      default:
        return '';
    }
  }
  
  createNewListing(): void {
    // Navigate to create listing page
    window.location.href = '/agent/create-listing';
  }
  
  editListing(id: string): void {
    window.location.href = `/agent/edit-listing/${id}`;
  }
  
  changePage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSaleListings();
    }
  }
  
  markAsSold(id: string): void {
    if (confirm('Are you sure you want to mark this listing as sold?')) {
      const statusRequest: ListingStatusUpdateRequest = { 
        status: ListingStatus.SOLD 
      };
      
      this.listingService.updateListingStatus(id, statusRequest).subscribe({
        next: () => {
          // Update the local list
          const index = this.listings.findIndex(l => l.id === id);
          if (index !== -1) {
            this.listings[index].status = ListingStatus.SOLD;
            this.applyFilters();
            this.calculateStats();
          }
          this.toastr.success('Listing has been marked as sold');

          // Create a sales transaction if needed
          this.createSalesTransaction(id);
        },
        error: (err: any) => {
          console.error('Error updating listing status:', err);
          this.toastr.error('Failed to update listing status');
        }
      });
    }
  }

  createSalesTransaction(listingId: string): void {
    // Check if a transaction for this listing already exists
    const existingTransaction = this.salesTransactions.find(t => t.listingId === listingId);
    if (existingTransaction) {
      // Update the transaction status if needed
      if (existingTransaction.transactionStatus !== TransactionStatus.COMPLETED) {
        this.updateSalesTransactionStatus(existingTransaction.id, TransactionStatus.COMPLETED);
      }
      return;
    }

    // Get the listing details
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing || !this.agentId) return;

    // Here we would typically have buyer information
    // For now, we'll just use a placeholder or prompt for buyer ID
    const buyerId = prompt('Enter the buyer ID:', '');
    if (!buyerId) return;

    const salesTransaction: SalesTransactionRequest = {
      listingId: listingId,
      buyerId: buyerId,
      agentId: this.agentId,
      amount: listing.price,
      transactionStatus: TransactionStatus.COMPLETED
    };

    this.transactionService.createSalesTransaction(salesTransaction).subscribe({
      next: (response) => {
        console.log('Created sales transaction:', response);
        this.toastr.success('Sales transaction created successfully');
        this.loadSalesTransactions();
      },
      error: (err) => {
        console.error('Error creating sales transaction:', err);
        this.toastr.error('Failed to create sales transaction');
      }
    });
  }

  updateSalesTransactionStatus(transactionId: string, status: string): void {
    this.transactionService.updateSalesTransactionStatus(transactionId, status).subscribe({
      next: (response) => {
        console.log('Updated sales transaction status:', response);
        this.toastr.success('Transaction status updated successfully');
        this.loadSalesTransactions();
      },
      error: (err) => {
        console.error('Error updating sales transaction status:', err);
        this.toastr.error('Failed to update transaction status');
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
} 