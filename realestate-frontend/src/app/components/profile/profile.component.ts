import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserResponse, UserStatus } from '../../models/auth.model';
import { UserAppointmentsComponent } from './appointments/user-appointments.component';
import { ListingService } from '../../services/listing.service';
import { ListingResponse } from '../../models/listing.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SavedSearchService } from '../../services/saved-search.service';
import { SavedSearchResponse } from '../../models/user-experience.model';
import { ReviewService } from '../../services/review.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FavoriteService } from '../../services/favorite.service';
import { PropertyService } from '../../services/property.service';
import { ToastrWrapperService } from '../../services/toastr-wrapper.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, UserAppointmentsComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  // Services
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private favoriteService = inject(FavoriteService);
  private propertyService = inject(PropertyService);
  private toastr = inject(ToastrWrapperService);

  // User properties
  user: UserResponse | null = null;
  isEditing = false;
  isLoading = true;
  errorMessage: string | null = null;
  profileForm = {
    name: '',
    email: '',
    phone: '',
    bio: ''
  };
  isLoginPage: boolean = false;
  isRegisterPage: boolean = false;
  isLoggedIn: boolean = false;
  isAgent: boolean = false;
  isAdmin: boolean = false;
  currentUser: any = null;
  
  // Make UserStatus enum available to template
  userStatusEnum = UserStatus;
  
  // Properties for favorites and saved searches
  favoriteProperties: any[] = [];
  favoritesLoading: boolean = false;
  favoritesError: string | null = null;
  
  savedSearches: SavedSearchResponse[] = [];
  savedSearchesLoading: boolean = false;
  savedSearchesError: string | null = null;
  
  recentlyViewed: any[] = [];
  
  // Property for active tab
  activeTab = 'profile';
  
  // Reviews properties
  userReviews: any[] = [];
  reviewsLoading: boolean = false;
  reviewsError: string | null = null;
  
  constructor(
    private userService: UserService,
    private router: Router,
    private listingService: ListingService,
    private savedSearchService: SavedSearchService,
    private reviewService: ReviewService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadUserProfileFromBackend();
    
    // Đặt tab hoạt động dựa trên URL hiện tại
    this.setActiveTabFromUrl();
    
    // Load data based on active tab
    if (this.activeTab === 'favorites') {
      this.loadFavoriteProperties();
    } else if (this.activeTab === 'saved-searches') {
      this.loadSavedSearches();
    } else if (this.activeTab === 'reviews') {
      this.loadUserReviews();
    }
    
    // Check for tab parameter in URL
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.setActiveTab(params['tab']);
      }
    });
  }
  
  // Load user profile from the backend API
  loadUserProfileFromBackend(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.errorMessage = 'Authentication token not available. Please login again.';
      this.isLoading = false;
      return;
    }
    const currentUser = this.authService.getCurrentUser();
    let userId = this.authService.getUserIdFromToken(token);
    if (!userId && currentUser && currentUser.id) {
      userId = currentUser.id;
    }
    
    if (userId) {
      console.log('Trying direct API call as last resort with ID:', userId);
      this.http.get<any>(`${environment.apiUrl}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).subscribe({
        next: (userData) => {
          console.log('User data received from direct API call:', userData);
          // Extract the user data from the response format
          let userDataObj = userData;
          if (userData.data) {
            userDataObj = userData.data;
          }
          
          this.user = userDataObj;
          
          // Ensure the name property is set
          if (this.user) {
            if (!this.user.name && this.user.firstName && this.user.lastName) {
              this.user.name = `${this.user.firstName} ${this.user.lastName}`;
            } else if (!this.user.name || this.user.name === this.user.id) {
              this.user.name = this.user.username !== this.user.id ? this.user.username : 'User';
            }
            
            // Initialize the form with user data
            this.profileForm.name = this.user.name || '';
            this.profileForm.email = this.user.email || '';
            this.profileForm.phone = this.user.phone || '';
            this.profileForm.bio = this.user.bio || '';
            
            // Update user in AuthService
            this.authService.updateCurrentUser(this.user);
          }
          
          this.isLoading = false;
          this.errorMessage = null;
        },
        error: (err) => {
          console.error('Error with direct API call:', err);
          this.isLoading = false;
          this.errorMessage = 'Could not load profile data. Please try again later.';
          this.handleProfileError(err);
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = 'User ID not available. Please login again.';
    }
  } 
  
  // Helper để xử lý lỗi profile
  private handleProfileError(error: any): void {
    // Log lỗi để debug
    console.error('Profile error details:', error);
    
    if (error.status === 401 || error.status === 403) {
      this.errorMessage = 'Your session has expired. Please login again.';
      // Redirect to login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } else if (error.status === 404) {
      // Trong trường hợp lỗi 404, API endpoint không tồn tại
      this.errorMessage = `Error loading profile: API endpoint not found. Using local data instead.`;
      console.warn('API endpoint not found, using localStorage data');
    } else {
      this.errorMessage = `Error loading profile: ${error.message || 'Unknown error'}`;
    }
    
    this.isLoading = false;
    
    // Luôn sử dụng dữ liệu từ localStorage nếu API fails
    const fallbackUser = this.authService.getCurrentUser();
    if (fallbackUser) {
      console.log('Using fallback data from localStorage:', fallbackUser);
      this.user = { ...fallbackUser }; // Tạo bản sao để tránh tham chiếu
      
      // Đảm bảo name được hiển thị đúng
      if (!this.user.name && this.user.firstName && this.user.lastName) {
        this.user.name = `${this.user.firstName} ${this.user.lastName}`;
      } else if (!this.user.name || this.user.name === this.user.id) {
        this.user.name = this.user.username !== this.user.id ? this.user.username : 'User';
      }
      
      this.profileForm.name = this.user.firstName && this.user.lastName ? 
                            `${this.user.firstName} ${this.user.lastName}` : 
                            (this.user.name || '');
      this.profileForm.email = this.user.email || '';
      this.profileForm.phone = this.user.phone || '';
      this.profileForm.bio = this.user.bio || '';
    }
  }
  
  // Tải danh sách các bất động sản yêu thích từ API
  loadFavoriteProperties(): void {
    if (!this.user) {
      this.user = {} as UserResponse;
    }
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.favoritesError = 'Authentication token not available';
      return;
    }

    // Sử dụng AuthService để lấy userId từ token
    const userId = this.authService.getUserIdFromToken(token);
    console.log(this.user);
    if (!userId) {
      this.favoritesError = 'Unable to identify user';
      return;
    }

    this.user.id = userId;
    this.favoritesLoading = true;
    this.favoritesError = null;
    
    this.favoriteService.getFavoritesByUser(this.user.id).subscribe({
      next: (response) => {
        const favorites = response.data || [];
        console.log("favorites", favorites);
        this.fetchFavoritePropertyDetails(favorites);
      },
      error: (error) => {
        this.favoritesLoading = false;
        this.favoritesError = 'Failed to load favorites: ' + (error.message || 'Unknown error');
      }
    });
  }
  
  fetchFavoritePropertyDetails(favorites: any[]): void {
    console.log('Processing favorites:', favorites);
    
    if (favorites.length === 0) {
      console.log('No favorites found');
      this.favoriteProperties = [];
      this.favoritesLoading = false;
      return;
    }
    
    const listingIds = favorites.map(fav => fav.listingId);
    console.log('Listing IDs to fetch:', listingIds);
    
    const fetchedProperties: any[] = [];
    let completedRequests = 0;
    
    listingIds.forEach(id => {
      console.log('Fetching property details for ID:', id);
      
      this.propertyService.getPropertyById(id).subscribe({
        next: (response: any) => {
          console.log('Property details response for ID ' + id + ':', response);
          
          if (response && response.data) {
            console.log('Property data extracted:', response.data);
            const property = response.data;
            // Add the favorite id for reference when removing
            const matchingFavorite = favorites.find(fav => fav.listingId === id);
            if (matchingFavorite) {
              property.favoriteId = matchingFavorite.id;
            }
            fetchedProperties.push(property);
          } else if (response) {
            // Direct response (not wrapped in data property)
            console.log('Direct property data:', response);
            const property = response;
            // Add the favorite id for reference when removing
            const matchingFavorite = favorites.find(fav => fav.listingId === id);
            if (matchingFavorite) {
              property.favoriteId = matchingFavorite.id;
            }
            fetchedProperties.push(property);
          } else {
            console.warn('No valid property data found for ID:', id);
          }
          
          console.log('Current fetched properties count:', fetchedProperties.length);
          checkCompletion();
        },
        error: (err) => {
          console.error('Error fetching property details for ID ' + id + ':', err);
          checkCompletion();
        }
      });
    });
    
    const checkCompletion = () => {
      completedRequests++;
      console.log(`Completed ${completedRequests}/${listingIds.length} property requests`);
      
      if (completedRequests === listingIds.length) {
        console.log('All property requests completed, setting favorites:', fetchedProperties);
        this.favoriteProperties = fetchedProperties;
        this.favoritesLoading = false;
      }
    };
  }
  
  loadSavedSearches(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.savedSearchesError = 'Unable to fetch saved searches: User ID not available';
      return;
    }
    
    this.savedSearchesLoading = true;
    console.log('Fetching saved searches for user ID:', currentUser.id);
    
    this.savedSearchService.getSavedSearches(currentUser.id)
      .pipe(
        catchError(error => {
          console.error('Error fetching saved searches:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (searches) => {
          console.log('Saved searches loaded:', searches);
          this.savedSearches = searches;
          this.savedSearchesLoading = false;
        },
        error: (error) => {
          console.error('Error in saved searches stream:', error);
          this.savedSearchesError = `Error loading saved searches: ${error.message || 'Unknown error'}`;
          this.savedSearchesLoading = false;
        }
      });
  }
  
  // Xóa saved search
  deleteSavedSearch(searchId: string): void {
    this.savedSearchService.deleteSavedSearch(searchId)
      .subscribe({
        next: () => {
          this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
          console.log('Search removed from saved searches');
        },
        error: (error) => {
          console.error('Error removing saved search:', error);
          this.savedSearchesError = `Error removing saved search: ${error.message || 'Unknown error'}`;
        }
      });
  }
  
  runSavedSearch(search: SavedSearchResponse): void {
    const queryParams = {
      keyword: search.keyword || '',
      minPrice: search.minPrice?.toString() || '',
      maxPrice: search.maxPrice?.toString() || '',
      bedrooms: search.bedrooms?.toString() || '',
      type: search.type || ''
    };
    
    this.router.navigate(['/properties'], { queryParams });
  }
  
  // Xóa property khỏi danh sách yêu thích
  removeFavorite(propertyId: string): void {
    if (!this.user?.id) {
      this.toastr.error('User ID not available');
      return;
    }
    
    this.favoriteService.removeFavorite(this.user.id, propertyId).subscribe({
      next: () => {
        this.favoriteProperties = this.favoriteProperties.filter(p => p.id !== propertyId);
        this.toastr.success('Removed from favorites');
      },
      error: (error) => {
        this.toastr.error('Failed to remove from favorites');
      }
    });
  }
  
  // Phương thức đặt tab hoạt động dựa trên URL
  private setActiveTabFromUrl(): void {
    const urlPath = this.router.url;
    
    if (urlPath.includes('/profile/favorites')) {
      this.activeTab = 'favorites';
    } else if (urlPath.includes('/profile/saved-searches')) {
      this.activeTab = 'saved-searches';
    } else if (urlPath.includes('/profile/appointments')) {
      this.activeTab = 'appointments';
    } else if (urlPath.includes('/profile/recent')) {
      this.activeTab = 'recent';
    } else if (urlPath.includes('/profile/reviews')) {
      this.activeTab = 'reviews';
    } else {
      this.activeTab = 'profile';
    }
  }
  
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }
  
  saveProfile(): void {
    if (!this.user) return;
    
    // Split the full name into first and last name
    const nameParts = this.profileForm.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const updateRequest = {
      id: this.user.id,
      firstName: firstName,
      lastName: lastName,
      bio: this.profileForm.bio,
      phone: this.profileForm.phone,
      // Email typically can't be changed directly, needs verification
    };
    
    console.log('Sending update request:', updateRequest);
    
    // Call the API to update the user profile
    this.userService.updateUser(updateRequest).subscribe({
      next: (updatedUser) => {
        console.log('Profile updated successfully:', updatedUser);
        this.user = updatedUser;
        
        // Ensure the name property is set
        if (!this.user.name && this.user.firstName && this.user.lastName) {
          this.user.name = `${this.user.firstName} ${this.user.lastName}`;
        } else if (!this.user.name || this.user.name === this.user.id) {
          this.user.name = this.user.username !== this.user.id ? this.user.username : 'User';
        }
        
        // Cập nhật thông tin user vào AuthService để cập nhật toàn cục
        this.authService.updateCurrentUser(this.user);
        
        this.isEditing = false;
        this.errorMessage = null; // Clear any previous errors
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = `Failed to update profile: ${error.message || 'Unknown error'}`;
        // Stay in edit mode so user can try again
      }
    });
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Load data based on selected tab if not already loaded
    if (tab === 'favorites' && this.favoriteProperties.length === 0) {
      this.loadFavoriteProperties();
    } else if (tab === 'saved-searches' && this.savedSearches.length === 0) {
      this.loadSavedSearches();
    } else if (tab === 'reviews' && this.userReviews.length === 0) {
      this.loadUserReviews();
    }
    
    // Update URL without navigating
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }
  
  
  // Định dạng giá tiền
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  // Định dạng diện tích
  formatArea(area: number): string {
    return `${area} m²`;
  }
  
  // Format ngày thành định dạng dễ đọc
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.currentUser = this.authService.getCurrentUser();
      this.isAgent = this.authService.isAgent();
      this.isAdmin = this.authService.isAdmin();
    } else {
      this.currentUser = null;
      this.isAgent = false;
      this.isAdmin = false;
    }
  }
  
  // Load user reviews from the backend
  loadUserReviews(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.reviewsError = 'Unable to fetch reviews: User ID not available';
      return;
    }
    
    this.reviewsLoading = true;
    console.log('Fetching reviews for user ID:', currentUser.id);
    
    this.reviewService.getUserReviews(currentUser.id)
      .pipe(
        catchError(error => {
          console.error('Error fetching user reviews:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (reviews) => {
          console.log('User reviews received:', reviews);
          this.userReviews = reviews;
          this.reviewsLoading = false;
          this.reviewsError = null;
        },
        error: (error) => {
          console.error('Error in user reviews subscription:', error);
          this.reviewsLoading = false;
          this.reviewsError = 'Failed to load your reviews. Please try again later.';
          // Fallback to mock data for development
          this.userReviews = this.getMockReviews();
        }
      });
  }
  
  // Edit review
  editReview(review: any): void {
    console.log('Editing review:', review);
    // Implement edit review logic here
    // Could navigate to edit page or open modal
  }
  
  // Delete review
  deleteReview(reviewId: string): void {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    console.log('Deleting review ID:', reviewId);
    this.reviewService.deleteReview(reviewId)
      .pipe(
        catchError(error => {
          console.error('Error deleting review:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          if (response !== null) {
            // Remove the review from the list
            this.userReviews = this.userReviews.filter(review => review.id !== reviewId);
            console.log('Review deleted successfully');
          }
        },
        error: (error) => {
          console.error('Error in delete review subscription:', error);
          alert('Failed to delete review. Please try again later.');
        }
      });
  }
  
  // Mock reviews for development/testing
  private getMockReviews(): any[] {
    return [
      {
        id: '1',
        propertyId: '101',
        propertyTitle: 'Modern Apartment in Downtown',
        rating: 4,
        comment: 'Great location and amenities. Very clean and modern.',
        createdAt: new Date().toISOString(),
        response: 'Thank you for your positive feedback! We hope to see you again soon.'
      },
      {
        id: '2',
        propertyId: '102',
        propertyTitle: 'Seaside Villa with Pool',
        rating: 5,
        comment: 'Amazing property with breathtaking views. Perfect for a family vacation.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        propertyId: '103',
        propertyTitle: 'Cozy Studio near University',
        rating: 3,
        comment: 'Decent place for the price. Could use some maintenance on the bathroom fixtures.',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        response: 'We appreciate your feedback and will address the maintenance issues you mentioned.'
      }
    ];
  }
} 