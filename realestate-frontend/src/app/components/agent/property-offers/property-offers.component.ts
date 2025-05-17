import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OfferService } from '../../../services/offer.service';
import { ListingService } from '../../../services/listing.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ToastrWrapperService } from '../../../services/toastr-wrapper.service';
import { OfferResponse, OfferStatus, OfferWithDetails } from '../../../models/offer.model';
import { ListingResponse } from '../../../models/listing.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-property-offers',
  templateUrl: './property-offers.component.html',
  styleUrls: ['./property-offers.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PropertyOffersComponent implements OnInit {
  private offerService = inject(OfferService);
  private listingService = inject(ListingService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastr = inject(ToastrWrapperService);
  private route = inject(ActivatedRoute);
  
  // Expose enum to template
  OfferStatus = OfferStatus;
  
  offers: OfferWithDetails[] = [];
  filteredOffers: OfferWithDetails[] = [];
  properties: ListingResponse[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  
  // Filtering and pagination
  currentPage = 0;
  totalPages = 0;
  selectedPropertyId: string | null = null;
  selectedStatus: OfferStatus | null = null;
  
  ngOnInit(): void {
    // Check if there's a listingId in the query params
    this.route.queryParams.subscribe(params => {
      if (params['listingId']) {
        this.selectedPropertyId = params['listingId'];
      }
      
      this.loadOffers();
      this.loadAgentProperties();
    });
  }
  
  loadOffers(page: number = 0): void {
    this.isLoading = true;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.errorMessage = 'User not authenticated';
      this.isLoading = false;
      return;
    }
    
    this.offerService.getAllOffers(page).pipe(
      catchError(error => {
        console.error('Error loading offers:', error);
        this.errorMessage = 'Failed to load offers';
        return of({ content: [], totalPages: 0 });
      }),
      switchMap(response => {
        console.log('Raw offers response:', response);
        this.totalPages = response.totalPages;
        const offerDetailRequests = response.content.map((offer: OfferResponse) => {
          return forkJoin({
            listing: this.listingService.getListingById(offer.listingId).pipe(
              catchError(() => of(null))
            ),
            buyer: this.userService.getUserById(offer.userId).pipe(
              catchError(() => of(null))
            ),
            offer: of(offer)
          });
        });
        
        if (offerDetailRequests.length === 0) {
          return of([]);
        }
        
        return forkJoin(offerDetailRequests);
      })
    ).subscribe(results => {
      if (Array.isArray(results)) {
        this.offers = results.map(result => {
          const offerWithDetails: OfferWithDetails = {
            ...result.offer,
            propertyTitle: result.listing?.title || 'Unknown Property',
            propertyImage: result.listing?.image || 'assets/images/property-placeholder.jpg',
            buyerName: result.buyer ? `${result.buyer.firstName} ${result.buyer.lastName}` : 'Unknown User',
            propertyType: result.listing?.type || 'Unknown'
          };
          return offerWithDetails;
        });
        
        console.log('Processed offers with details:', this.offers);
      } else {
        this.offers = [];
      }
      
      this.filterOffers();
      this.isLoading = false;
    }, error => {
      console.error('Error loading offer details:', error);
      this.errorMessage = 'Failed to load offer details';
      this.isLoading = false;
    });
  }
  
  loadAgentProperties(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return;
    }
    
    this.listingService.getListingsPaged(1, 100).subscribe(response => {
      if (response && response.items) {
        this.properties = response.items.filter(item => item.ownerId === currentUser.id);
      } else {
        this.properties = [];
      }
    }, error => {
      console.error('Error loading agent properties:', error);
    });
  }
  
  filterOffers(): void {
    let filtered = [...this.offers];
    
    if (this.selectedPropertyId) {
      filtered = filtered.filter(offer => offer.listingId === this.selectedPropertyId);
    }
    
    if (this.selectedStatus) {
      filtered = filtered.filter(offer => offer.status === this.selectedStatus);
    }
    
    this.filteredOffers = filtered;
  }
  
  onPropertyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPropertyId = select.value || null;
    this.filterOffers();
  }
  
  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value as OfferStatus || null;
    this.filterOffers();
  }
  
  resetFilters(): void {
    this.selectedPropertyId = null;
    this.selectedStatus = null;
    this.filterOffers();
  }
  
  acceptOffer(offerId: string): void {
    console.log('Accept button clicked for offer:', offerId);
    
    this.offerService.acceptOffer(offerId).subscribe({
      next: (response) => {
        console.log('Offer accepted successfully:', response);
        this.toastr.success('Offer accepted successfully');
        // Update the offer status in the list
        this.updateOfferStatusInList(offerId, OfferStatus.ACCEPTED);
      },
      error: (error) => {
        console.error('Error accepting offer:', error);
        this.toastr.error('Failed to accept offer');
      }
    });
  }
  
  rejectOffer(offerId: string): void {
    this.offerService.rejectOffer(offerId).subscribe({
      next: (response) => {
        this.toastr.success('Offer rejected');
        // Update the offer status in the list
        this.updateOfferStatusInList(offerId, OfferStatus.REJECTED);
      },
      error: (error) => {
        console.error('Error rejecting offer:', error);
        this.toastr.error('Failed to reject offer');
      }
    });
  }
  
  deleteOffer(offerId: string): void {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offerService.deleteOffer(offerId).subscribe({
        next: () => {
          this.toastr.success('Offer deleted successfully');
          // Remove the offer from both arrays
          this.offers = this.offers.filter(o => o.id !== offerId);
          this.filteredOffers = this.filteredOffers.filter(o => o.id !== offerId);
        },
        error: (error) => {
          console.error('Error deleting offer:', error);
          this.toastr.error('Failed to delete offer. Please try again.');
        }
      });
    }
  }
  
  updateOfferStatusInList(offerId: string, status: OfferStatus): void {
    // Update in main offers array
    const offerIndex = this.offers.findIndex(o => o.id === offerId);
    if (offerIndex !== -1) {
      this.offers[offerIndex].status = status;
    }
    
    // Update in filtered offers array
    const filteredIndex = this.filteredOffers.findIndex(o => o.id === offerId);
    if (filteredIndex !== -1) {
      this.filteredOffers[filteredIndex].status = status;
    }
  }
  
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOffers(page);
    }
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  getStatusClass(status: OfferStatus): string {
    switch (status) {
      case OfferStatus.PENDING:
        return 'bg-warning';
      case OfferStatus.ACCEPTED:
        return 'bg-success';
      case OfferStatus.REJECTED:
        return 'bg-danger';
      case OfferStatus.EXPIRED:
        return 'bg-secondary';
      default:
        return 'bg-info';
    }
  }
  
  // Helper method to safely check offer status
  isStatus(offerStatus: string | OfferStatus, statusToCheck: OfferStatus): boolean {
    // Check for string equality (case insensitive)
    if (typeof offerStatus === 'string') {
      return offerStatus.toUpperCase() === statusToCheck.toString();
    }
    // Check for enum equality
    return offerStatus === statusToCheck;
  }
} 