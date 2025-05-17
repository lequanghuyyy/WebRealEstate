import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OfferService } from '../../../services/offer.service';
import { ListingService } from '../../../services/listing.service';
import { ToastrWrapperService } from '../../../services/toastr-wrapper.service';
import { OfferResponse, OfferStatus, OfferWithDetails } from '../../../models/offer.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-user-offers',
  templateUrl: './user-offers.component.html',
  styleUrls: ['./user-offers.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class UserOffersComponent implements OnInit {
  @Input() userId: string = '';
  
  offers: OfferWithDetails[] = [];
  filteredOffers: OfferWithDetails[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // Filtering
  statusFilter: string = '';
  
  // Pagination
  currentPage: number = 0;
  totalPages: number = 0;
  
  constructor(
    private offerService: OfferService,
    private listingService: ListingService,
    private toastr: ToastrWrapperService
  ) {}
  
  ngOnInit(): void {
    if (this.userId) {
      this.loadUserOffers();
    } else {
      this.errorMessage = 'User ID not provided';
      this.isLoading = false;
    }
  }
  
  loadUserOffers(page: number = 0): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.offerService.getOffersByUser(this.userId, page).subscribe({
      next: (response) => {
        if (response && response.content) {
          this.processOffers(response.content);
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
        } else {
          this.offers = [];
          this.filteredOffers = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user offers:', error);
        this.errorMessage = 'Failed to load your offers. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  
  processOffers(offerData: any[]): void {
    // Create an array of observables to fetch listing details for each offer
    const listingObservables = offerData.map(offer => 
      this.listingService.getListingById(offer.listingId).pipe(
        catchError(() => of(null))
      )
    );
    
    forkJoin(listingObservables).subscribe({
      next: (listings) => {
        this.offers = offerData.map((offer, index) => {
          const listing = listings[index];
          
          const offerWithDetails: OfferWithDetails = {
            ...offer,
            propertyTitle: listing ? listing.title : 'Unknown Property',
            propertyImage: listing && listing.images && listing.images.length > 0 
              ? (listing.images[0].imageUrl || 'assets/images/property-placeholder.jpg')
              : 'assets/images/property-placeholder.jpg',
            propertyType: listing ? listing.type : 'Unknown'
          };
          
          return offerWithDetails;
        });
        
        this.filterOffers();
      },
      error: (error) => {
        console.error('Error fetching listing details:', error);
        // Still construct offers but with placeholder data
        this.offers = offerData.map(offer => ({
          ...offer,
          propertyTitle: 'Unknown Property',
          propertyImage: 'assets/images/property-placeholder.jpg',
          propertyType: 'Unknown'
        }));
        
        this.filterOffers();
      }
    });
  }
  
  filterOffers(): void {
    let filtered = [...this.offers];
    
    if (this.statusFilter) {
      filtered = filtered.filter(offer => offer.status === this.statusFilter);
    }
    
    this.filteredOffers = filtered;
  }
  
  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusFilter = select.value;
    this.filterOffers();
  }
  
  resetFilters(): void {
    this.statusFilter = '';
    this.filterOffers();
  }
  
  changePage(page: number): void {
    if (page !== this.currentPage && page >= 0 && page < this.totalPages) {
      this.loadUserOffers(page);
    }
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case OfferStatus.PENDING:
        return 'badge-pending';
      case OfferStatus.ACCEPTED:
        return 'badge-accepted';
      case OfferStatus.REJECTED:
        return 'badge-rejected';
      case OfferStatus.EXPIRED:
        return 'badge-expired';
      default:
        return '';
    }
  }
  
  deleteOffer(offerId: string): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(offerId).subscribe({
        next: () => {
          this.toastr.success('Offer deleted successfully');
          this.offers = this.offers.filter(offer => offer.id !== offerId);
          this.filterOffers();
        },
        error: (error) => {
          console.error('Error deleting offer:', error);
          this.toastr.error('Failed to delete offer. Please try again.');
        }
      });
    }
  }
} 