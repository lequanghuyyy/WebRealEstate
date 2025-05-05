import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationExtras } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ListingService } from '../../services/listing.service';
import { ListingResponse } from '../../models/listing.model';
import { RecommendationService } from '../../services/recommendation.service';
import { RecommendationResponse } from '../../models/recommendation.model';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ListingType, ListingPropertyType } from '../../models/listing.model';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SavedSearchService } from '../../services/saved-search.service';
import { SavedSearchRequest } from '../../models/user-experience.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  searchType: string = 'buy';
  isLoggedIn: boolean = false;
  user: any = null;
  
  // Search form
  searchForm: FormGroup;
  
  // Notification message
  notification: { type: string; message: string; icon: string } | null = null;
  
  // Featured properties data
  featuredProperties: ListingResponse[] = [];
  featuredLoading: boolean = false;
  featuredError: string | null = null;
  
  // Recommended properties for logged-in users
  recommendedProperties: ListingResponse[] = [];
  recommendationLoading: boolean = false;
  recommendationError: string | null = null;
  
  // Property for tracking user recommendation data
  userRecommendation: RecommendationResponse | null = null;
  
  constructor(
    private authService: AuthService, 
    private router: Router,
    private listingService: ListingService,
    private recommendationService: RecommendationService,
    private savedSearchService: SavedSearchService,
    private fb: FormBuilder
  ) {
    // Khởi tạo form tìm kiếm
    this.searchForm = this.fb.group({
      keyword: [''],
      propertyType: [''],
      priceRange: [''],
      bedrooms: [''],
      type: [this.searchType] // Default to the current search type
    });
  }
  
  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      // Lấy thông tin user đã đăng nhập
      this.user = this.authService.getCurrentUser();
      
      // Đăng ký theo dõi thay đổi của thông tin người dùng
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          console.log('User information updated in home component:', user);
          this.user = user;
          
          // Nếu user đã thay đổi và có ID, load lại recommendations
          if (user.id && (!this.recommendedProperties.length || this.recommendationError)) {
            this.loadRecommendedProperties();
          }
        }
      });
      
      // Load recommendations ngay lập tức nếu đã có ID
      if (this.user && this.user.id) {
        this.loadRecommendedProperties();
      }
    }
    
    this.loadFeaturedProperties();
  }
  
  // Lấy dữ liệu bất động sản đề xuất dựa trên sở thích của người dùng
  loadRecommendedProperties(): void {
    if (!this.user) {
      this.recommendationError = 'User not available';
      return;
    }
    
    if (!this.user.id) {
      console.error('User object exists but ID is missing:', this.user);
      this.recommendationError = 'User ID not available';
      return;
    }
    
    this.recommendationLoading = true;
    console.log('Loading recommended properties for user:', this.user);
    console.log('User ID for recommendations:', this.user.id);
    
    // Lấy dữ liệu recommendation từ API
    this.recommendationService.getRecommendations(this.user.id)
      .pipe(
        catchError(error => {
          console.error('Error fetching recommendations:', error);
          return of(null);
        }),
        switchMap(recommendation => {
          if (!recommendation || !recommendation.listingIds || recommendation.listingIds.length === 0) {
            console.log('No recommendations available, using default listings');
            // Nếu không có recommendation, lấy bất động sản phổ biến
            return this.listingService.getFeaturedListings(3);
          }
          
          // Lưu thông tin recommendation để hiển thị
          this.userRecommendation = recommendation;
          console.log('User recommendation data:', recommendation);
          
          // Lấy chi tiết các bất động sản từ listingIds
          return this.listingService.getListingsByIds(recommendation.listingIds)
            .pipe(
              catchError(error => {
                console.error('Error fetching recommended listings:', error);
                return of([]);
              })
            );
        })
      )
      .subscribe({
        next: (listings) => {
          console.log('Recommended properties loaded:', listings);
          this.recommendedProperties = listings;
          this.recommendationLoading = false;
        },
        error: (error) => {
          console.error('Error in recommendation stream:', error);
          this.recommendationError = 'Failed to load recommended properties';
          this.recommendationLoading = false;
        }
      });
  }
  
  // Lấy dữ liệu bất động sản nổi bật (có nhiều lượt xem)
  loadFeaturedProperties(): void {
    this.featuredLoading = true;
    this.featuredError = null;
    
    console.log('Loading featured properties... User logged in:', this.isLoggedIn);
    
    // Không sử dụng fetch mà dùng đúng service
    this.listingService.getFeaturedListings(6)
      .subscribe({
        next: (listings) => {
          console.log('Featured properties loaded successfully:', listings);
          console.log('Number of listings received:', listings ? listings.length : 0);
          
          if (!listings || listings.length === 0) {
            console.warn('No featured properties were returned from the API');
            
            // Thử tải lại một lần nữa sau 1 giây
            setTimeout(() => {
              this.listingService.getFeaturedListings(6)
                .subscribe({
                  next: (retryListings) => {
                    if (retryListings && retryListings.length > 0) {
                      console.log('Retry succeeded, listings:', retryListings.length);
                      this.featuredProperties = retryListings;
                    } else {
                      console.warn('Retry failed, still no properties');
                    }
                    this.featuredLoading = false;
                  },
                  error: (error) => {
                    console.error('Retry error:', error);
                    this.featuredLoading = false;
                  }
                });
            }, 1000);
          } else {
            this.featuredProperties = listings;
            this.featuredLoading = false;
          }
        },
        error: (error) => {
          console.error('Error in featured properties stream:', error);
          this.featuredError = `Failed to load featured properties: ${error.message || 'Unknown error'}`;
          this.featuredLoading = false;
        }
      });
  }
  
  // Phương thức xử lý tìm kiếm và chuyển hướng
  searchProperties(): void {
    console.log('Searching properties with criteria:', this.searchForm.value);
    
    // Lấy các giá trị từ form
    const formValues = this.searchForm.value;
    
    // Tạo query params dựa trên các trường đã điền
    const queryParams: any = {};
    
    // Thêm keyword nếu có
    if (formValues.keyword) {
      queryParams.keyword = formValues.keyword;
    }
    
    // Thêm property type nếu có
    if (formValues.propertyType) {
      queryParams.propertyType = formValues.propertyType;
    }
    
    // Thêm bedrooms nếu có
    if (formValues.bedrooms) {
      queryParams.bedrooms = formValues.bedrooms;
    }
    
    // Xử lý price range
    if (formValues.priceRange) {
      switch(formValues.priceRange) {
        case 'range1':
          queryParams.maxPrice = 500000000; // Dưới 500 triệu
          break;
        case 'range2':
          queryParams.minPrice = 500000000;
          queryParams.maxPrice = 1000000000; // 500tr - 1 tỷ
          break;
        case 'range3':
          queryParams.minPrice = 1000000000;
          queryParams.maxPrice = 3000000000; // 1 tỷ - 3 tỷ
          break;
        case 'range4':
          queryParams.minPrice = 3000000000; // Trên 3 tỷ
          break;
      }
    }
    
    // Thêm type (rent/buy) dựa trên tab đang chọn
    if (this.searchType === 'buy') {
      queryParams.type = 'SALE';
    } else if (this.searchType === 'rent') {
      queryParams.type = 'RENT';
    }
    
    // Tạo navigation extras để chuyển hướng với query params
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    
    // Chuyển hướng đến trang properties với các bộ lọc
    this.router.navigate(['/properties'], navigationExtras);
  }
  
  // Helper method to update search type
  updateSearchType(type: string): void {
    this.searchType = type;
    this.searchForm.patchValue({
      type: this.searchType === 'buy' ? 'SALE' : 'RENT'
    });
  }
  
  // Phương thức để lưu tìm kiếm hiện tại
  saveSearch(): void {
    // Kiểm tra người dùng đã đăng nhập chưa
    if (!this.isLoggedIn || !this.user) {
      // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }
    
    console.log('Saving search criteria:', this.searchForm.value);
    
    // Lấy các giá trị từ form
    const formValues = this.searchForm.value;
    
    // Xác định price range dựa trên lựa chọn
    let minPrice = 0;
    let maxPrice = 0;
    
    if (formValues.priceRange) {
      switch(formValues.priceRange) {
        case 'range1':
          maxPrice = 500000000; // Dưới 500 triệu
          break;
        case 'range2':
          minPrice = 500000000;
          maxPrice = 1000000000; // 500tr - 1 tỷ
          break;
        case 'range3':
          minPrice = 1000000000;
          maxPrice = 3000000000; // 1 tỷ - 3 tỷ
          break;
        case 'range4':
          minPrice = 3000000000; // Trên 3 tỷ
          break;
      }
    }
    
    // Tạo request object
    const savedSearchRequest: SavedSearchRequest = {
      userId: this.user.id,
      keyword: formValues.keyword || '',
      minPrice: minPrice.toString(),
      maxPrice: maxPrice.toString(),
      bedrooms: formValues.bedrooms ? parseInt(formValues.bedrooms) : 0,
      type: this.searchType === 'buy' ? 'SALE' : 'RENT'
    };
    
    console.log('Sending saved search request:', savedSearchRequest);
    
    // Gửi request lên server
    this.savedSearchService.saveSearch(savedSearchRequest)
      .subscribe({
        next: (response) => {
          console.log('Search criteria saved successfully:', response);
          // Show success notification
          this.showNotification('success', 'Search criteria saved successfully!', 'fas fa-check-circle');
        },
        error: (error) => {
          console.error('Error saving search criteria:', error);
          console.error('Error details:', {
            status: error.status,
            message: error.message,
            url: error.url,
            error: error.error
          });
          // Show error notification
          this.showNotification('error', `Failed to save search criteria. Error: ${error.status}`, 'fas fa-exclamation-circle');
        }
      });
  }
  
  // Helper method to show notifications
  private showNotification(type: string, message: string, icon: string): void {
    this.notification = { type, message, icon };
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }
  
  // Phương thức để xem chi tiết bất động sản
  viewPropertyDetails(propertyId: string): void {
    this.router.navigate(['/property', propertyId]);
  }
  
  // Định dạng giá tiền
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  // Định dạng diện tích
  formatArea(area: number): string {
    return `${area} m²`;
  }
}