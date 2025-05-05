import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Property } from '../../models/property.model';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PropertyApiService } from '../../services/property-api.service';
import { 
  ListingResponse, 
  ListingSearchRequest, 
  ListingType,
  ListingStatus,
  ListingPropertyType,
  PageDto
} from '../../models/listing.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject, of, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class PropertiesComponent implements OnInit, OnDestroy {
  properties: ListingResponse[] = [];
  filteredProperties: ListingResponse[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // Add Math for template access
  Math = Math;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Sorting
  sortOptions: string[] = ['Newest', 'Price (Low to High)', 'Price (High to Low)', 'Most Popular'];
  selectedSort: string = 'Newest';
  
  // Property Types from enum
  propertyTypes = Object.values(ListingPropertyType);
  listingTypes = Object.values(ListingType);
  
  // Filter Form
  filterForm: FormGroup;
  
  // UI state
  isFilterOpen: { [key: string]: boolean } = {
    propertyType: true,
    priceRange: true,
    bedrooms: true,
    bathrooms: true,
    location: true,
    squareFeet: true,
    listingType: true
  };
  
  showMobileFilters: boolean = false;
  
  // For search debounce
  private searchTerms = new Subject<void>();
  private destroy$ = new Subject<void>();
  
  // Cache for properties
  private allPropertiesCache: ListingResponse[] = [];
  private lastSearchRequest: ListingSearchRequest | null = null;
  private subscriptions: Subscription[] = [];
  private initialLoadComplete = false;
  
  constructor(
    private propertyApiService: PropertyApiService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.filterForm = this.fb.group({
      propertyType: [''],
      priceMin: [null],
      priceMax: [null],
      bedrooms: [null],
      bathrooms: [null],
      city: [''],
      minArea: [null],
      maxArea: [null],
      keyword: [''],
      type: ['']
    });
  }

  ngOnInit(): void {
    // First, set up query parameters
    const querySub = this.route.queryParams.subscribe(params => {
      const formValues: any = {};
      
      if (params['keyword']) formValues.keyword = params['keyword'];
      if (params['city']) formValues.city = params['city'];
      if (params['minPrice']) formValues.priceMin = Number(params['minPrice']);
      if (params['maxPrice']) formValues.priceMax = Number(params['maxPrice']);
      if (params['minArea']) formValues.minArea = Number(params['minArea']);
      if (params['maxArea']) formValues.maxArea = Number(params['maxArea']);
      if (params['bedrooms']) formValues.bedrooms = Number(params['bedrooms']);
      if (params['bathrooms']) formValues.bathrooms = Number(params['bathrooms']);
      if (params['type']) formValues.type = params['type'];
      if (params['propertyType']) formValues.propertyType = params['propertyType'];
      if (params['page']) this.currentPage = Number(params['page']);
      
      // Update the form if any values were found
      if (Object.keys(formValues).length > 0) {
        this.filterForm.patchValue(formValues, { emitEvent: false });
      }
    });
    this.subscriptions.push(querySub);
    
    // Subscribe to search terms changes with increased debounce time
    const searchSub = this.searchTerms.pipe(
      takeUntil(this.destroy$),
      debounceTime(800), // Increase to 800ms for better performance
      distinctUntilChanged(), // ignore if same as previous search term
    ).subscribe(() => {
      this.currentPage = 1; // Reset to first page on new search
      this.updateQueryParams();
      this.applyFilters();
    });
    this.subscriptions.push(searchSub);
    
    // Immediately load data with filters if any are active, otherwise load paged data
    if (this.hasActiveFilters()) {
      this.applyFilters(true); // Force refresh with filters
    } else {
      // Start with paged loading for faster initial load (without caching all at once)
      this.loadAllPropertiesPaged();
    }
  }
  
  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Handle immediate filtering when a user selects criteria
  onImmediateFilter(): void {
    // Reset to first page on any filter change
    this.currentPage = 1;
    
    console.log('Immediate filter triggered with values:', this.filterForm.getRawValue());
    
    // Update URL query params
    this.updateQueryParams();
    
    // Apply filters immediately
    this.applyFilters(true);
  }

  // Load all properties for local filtering
  loadAllProperties(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.propertyApiService.getListings().subscribe({
      next: (listings) => {
        console.log('Loaded all properties:', listings ? listings.length : 0);
        // Print out some property info for debugging
        if (listings && Array.isArray(listings)) {
          listings.forEach(listing => {
            console.log(`ID: ${listing.id}, Type: ${listing.type}, PropertyType: ${listing.propertyType}, Title: ${listing.title}`);
          });
          
          this.allPropertiesCache = listings;
        } else {
          console.error('Received non-array data from getListings:', listings);
          this.allPropertiesCache = [];
        }
        
        this.initialLoadComplete = true;
        
        // Check if there are active filters in URL
        if (this.hasActiveFilters()) {
          this.applyFilters(true); // Force refresh of filters from current URL params
        } else {
          // Just show all properties without filters
          this.properties = [...this.allPropertiesCache];
          this.totalItems = this.allPropertiesCache.length;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          
          // Apply pagination
          const startIndex = (this.currentPage - 1) * this.itemsPerPage;
          const endIndex = startIndex + this.itemsPerPage;
          this.filteredProperties = this.allPropertiesCache.slice(startIndex, endIndex);
          
          this.isLoading = false;
          this.applyLocalSorting();
        }
      },
      error: (error) => {
        console.error('Error loading all properties:', error);
        this.initialLoadComplete = true;
        this.isLoading = false;
        this.errorMessage = 'Error loading properties. Please try again.';
        // Attempt to load with pagination as fallback
        this.loadAllPropertiesPaged();
      }
    });
  }
  
  // Apply filters locally when possible
  applyFilters(forceRefresh: boolean = false): void {
    this.isLoading = true;
    
    // Get current filter values
    const formValues = this.filterForm.getRawValue();
    console.log('Applying filters with form values:', formValues);
    
    // Ensure we're filtering with valid criteria
    if (this.hasActiveFilters()) {
      console.log('Active filters detected - filtering properties');
      
      // If we have cached properties and only need local filtering
      if (this.allPropertiesCache.length > 0 && this.canFilterLocally()) {
        console.log('Applying filters locally');
        this.filterPropertiesLocally();
        return;
      }
      
      // Otherwise use server filtering
      this.loadPropertiesFromServer(forceRefresh);
    } else {
      console.log('No active filters - showing all properties');
      // No filters active, just load all properties
      if (this.allPropertiesCache.length > 0) {
        console.log('Using cached properties');
        this.properties = [...this.allPropertiesCache];
        this.totalItems = this.allPropertiesCache.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        
        // Apply pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.filteredProperties = this.allPropertiesCache.slice(startIndex, endIndex);
        
        this.isLoading = false;
        this.applyLocalSorting();
      } else {
        this.loadAllPropertiesPaged();
      }
    }
  }
  
  // Check if we can filter locally (for lightweight filters)
  canFilterLocally(): boolean {
    const formValues = this.filterForm.getRawValue();
    
    // For certain complex filters, we should use server-side filtering
    if (formValues.keyword) return false; // Keyword search is complex, use server
    
    return true; // Default to local filtering for better performance
  }
  
  // Filter properties locally from the cache
  filterPropertiesLocally(): void {
    const formValues = this.filterForm.getRawValue();
    console.log('Filtering with criteria:', formValues);
    
    let filtered = [...this.allPropertiesCache];
    console.log('Initial properties count:', filtered.length);
    
    // Debug log for Villa and SALE properties
    console.log('Villa properties:', filtered.filter(p => p.propertyType === 'Villa').length);
    console.log('SALE properties:', filtered.filter(p => p.type === 'SALE').length);
    console.log('Villa AND SALE properties:', filtered.filter(p => p.propertyType === 'Villa' && p.type === 'SALE').length);
    
    // Apply filters one by one and log the results
    if (formValues.propertyType) {
      console.log(`Filtering by propertyType: ${formValues.propertyType}`);
      filtered = filtered.filter(p => p.propertyType === formValues.propertyType);
      console.log(`After propertyType filter: ${filtered.length} properties left`);
      
      // Print what's left
      filtered.forEach(p => {
        console.log(`ID: ${p.id}, Type: ${p.type}, PropertyType: ${p.propertyType}, Title: ${p.title}`);
      });
    }
    
    if (formValues.type) {
      console.log(`Filtering by type: ${formValues.type}`);
      filtered = filtered.filter(p => p.type === formValues.type);
      console.log(`After type filter: ${filtered.length} properties left`);
      
      // Print what's left
      filtered.forEach(p => {
        console.log(`ID: ${p.id}, Type: ${p.type}, PropertyType: ${p.propertyType}, Title: ${p.title}`);
      });
    }
    
    if (formValues.priceMin) {
      console.log(`Filtering by minimum price: ${formValues.priceMin}`);
      filtered = filtered.filter(p => p.price >= Number(formValues.priceMin));
      console.log(`After min price filter: ${filtered.length} properties left`);
    }
    
    if (formValues.priceMax) {
      console.log(`Filtering by maximum price: ${formValues.priceMax}`);
      filtered = filtered.filter(p => p.price <= Number(formValues.priceMax));
      console.log(`After max price filter: ${filtered.length} properties left`);
    }
    
    if (formValues.minArea) {
      console.log(`Filtering by minimum area: ${formValues.minArea}`);
      filtered = filtered.filter(p => p.area >= Number(formValues.minArea));
      console.log(`After min area filter: ${filtered.length} properties left`);
    }
    
    if (formValues.maxArea) {
      console.log(`Filtering by maximum area: ${formValues.maxArea}`);
      filtered = filtered.filter(p => p.area <= Number(formValues.maxArea));
      console.log(`After max area filter: ${filtered.length} properties left`);
    }
    
    if (formValues.bedrooms) {
      console.log(`Filtering by bedrooms: ${formValues.bedrooms}`);
      filtered = filtered.filter(p => p.bedrooms === Number(formValues.bedrooms));
      console.log(`After bedrooms filter: ${filtered.length} properties left`);
    }
    
    // Update total count before pagination
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    console.log(`Total filtered properties: ${this.totalItems}, total pages: ${this.totalPages}`);
    
    // Make sure current page is valid
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      console.log(`Adjusting current page from ${this.currentPage} to ${this.totalPages}`);
      this.currentPage = this.totalPages;
    }
    
    // Get current page items (handle empty results case)
    if (filtered.length === 0) {
      console.log('No matching properties found for the current filters');
      this.filteredProperties = [];
      this.properties = [];
    } else {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.filteredProperties = filtered.slice(startIndex, endIndex);
      this.properties = this.filteredProperties;
    }
    
    this.isLoading = false;
    
    // Apply sorting if we have items
    if (this.filteredProperties.length > 0) {
      this.applyLocalSorting();
    }
    
    console.log(`Filtered to ${this.totalItems} total properties, showing ${this.filteredProperties.length} on page ${this.currentPage}`);
  }
  
  // Load properties from server
  loadPropertiesFromServer(forceRefresh: boolean = false): void {
    this.isLoading = true;
    this.errorMessage = null;
        const searchRequest = this.createSearchRequest();
            if (!forceRefresh && this.lastSearchRequest && 
        JSON.stringify(this.lastSearchRequest) === JSON.stringify(searchRequest)) {
      this.isLoading = false;
      return;
    }
    
    // Save current request
    this.lastSearchRequest = {...searchRequest};
        const hasFilters = this.hasActiveFilters();
    if (hasFilters) {
      console.log('Sending search request to server:', searchRequest);
      this.propertyApiService.searchListings(searchRequest).subscribe({
        next: (response: PageDto<ListingResponse>) => {
          console.log('Search response from server:', response);
                    if (response.items) {
            this.properties = response.items;
            this.filteredProperties = response.items;
            this.totalItems = response.totalElements || 0;
            this.totalPages = response.totalPages || 0;
                        if (this.currentPage > this.totalPages && this.totalPages > 0) {
              this.currentPage = this.totalPages;
              this.updateQueryParams();
              // Reload with corrected page
              this.loadPropertiesFromServer(true);
              return;
            }
            
            this.isLoading = false;
            this.applyLocalSorting();
            
            console.log(`Server returned ${this.totalItems} total properties, showing ${this.filteredProperties.length} on page ${this.currentPage}`);
          }
          
          // If we got no results, don't try to show all properties
          if (!response.items || response.items.length === 0) {
            console.log('No matching properties found for the current filters');
            this.properties = [];
            this.filteredProperties = [];
            this.totalItems = 0;
            this.totalPages = 0;
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error searching listings:', error);
          
          // Try local filtering since server API might have issues
          if (this.allPropertiesCache.length > 0) {
            console.log('API error, using local filtering instead');
            
            // Show info message rather than error
            this.errorMessage = 'Using local filtering for your search criteria...';
            
            // Apply filters locally
            this.filterPropertiesLocally();
          } else {
            // Show more helpful error message
            if (error.status === 500) {
              this.errorMessage = 'The server encountered an error processing your search. Using alternative filtering method...';
            } else {
              this.errorMessage = `Error loading properties (${error.status}). Trying alternative methods...`;
            }
            
            this.loadAllPropertiesPaged();
          }
        }
      });
    } else {
      this.loadAllPropertiesPaged();
    }
  }
  
  createSearchRequest(): ListingSearchRequest {
    const formValues = this.filterForm.getRawValue(); // Use getRawValue() to ensure we get all values including disabled controls
    const searchRequest: ListingSearchRequest = {
      page: this.currentPage, // Server will subtract 1 already in: PageRequest.of(searchRequest.getPage() - 1, ...)
      size: this.itemsPerPage
    };
    
    if (formValues.keyword) searchRequest.keyword = formValues.keyword.trim();
    if (formValues.city) searchRequest.city = formValues.city.trim();
    if (formValues.priceMin) searchRequest.minPrice = Number(formValues.priceMin);
    if (formValues.priceMax) searchRequest.maxPrice = Number(formValues.priceMax);
    if (formValues.minArea) searchRequest.minArea = Number(formValues.minArea);
    if (formValues.maxArea) searchRequest.maxArea = Number(formValues.maxArea);
    if (formValues.bedrooms) searchRequest.bedrooms = Number(formValues.bedrooms);
    if (formValues.bathrooms) searchRequest.bathrooms = Number(formValues.bathrooms);
    if (formValues.type) searchRequest.type = formValues.type as ListingType;
    if (formValues.propertyType) searchRequest.propertyType = formValues.propertyType as ListingPropertyType;
    
    return searchRequest;
  }
  
  // Reset all filters
  resetFilters(): void {
    this.filterForm.reset({
      propertyType: '',
      priceMin: null,
      priceMax: null,
      bedrooms: null,
      bathrooms: null,
      city: '',
      minArea: null,
      maxArea: null,
      keyword: '',
      type: ''
    });
    this.currentPage = 1;
    this.lastSearchRequest = null;
    
    // Navigate with empty query params to clear URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1 }
    });
    
    // Use local filtering if cache available
    if (this.allPropertiesCache.length > 0) {
      this.filterPropertiesLocally();
    } else {
      this.loadPropertiesFromServer(true);
    }
  }
  
  // Sorting locally
  applyLocalSorting(): void {
    switch (this.selectedSort) {
      case 'Newest':
        this.filteredProperties.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'Price (Low to High)':
        this.filteredProperties.sort((a, b) => a.price - b.price);
        break;
      case 'Price (High to Low)':
        this.filteredProperties.sort((a, b) => b.price - a.price);
        break;
      case 'Most Popular':
        this.filteredProperties.sort((a, b) => (b.view || 0) - (a.view || 0));
        break;
    }
  }
  
  // Update sort and reload data
  updateSort(option: string): void {
    this.selectedSort = option;
    this.applyLocalSorting();
  }
  
  // Change page and reload data
  changePage(page: number): void {
    if (page < 1 || (this.totalPages > 0 && page > this.totalPages)) return;
    
    this.currentPage = page;
    this.updateQueryParams();
    
    // Use local filtering when possible
    if (this.allPropertiesCache.length > 0 && this.canFilterLocally()) {
      this.filterPropertiesLocally();
    } else {
      this.loadPropertiesFromServer(true);
    }
    
    // Scroll to top of the page for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Update query parameters in URL
  updateQueryParams(): void {
    const formValues = this.filterForm.getRawValue();
    const queryParams: any = { page: this.currentPage };
    
    // Only add non-empty values to query params
    if (formValues.keyword) queryParams.keyword = formValues.keyword.trim();
    if (formValues.city) queryParams.city = formValues.city.trim();
    if (formValues.priceMin) queryParams.minPrice = formValues.priceMin;
    if (formValues.priceMax) queryParams.maxPrice = formValues.priceMax;
    if (formValues.minArea) queryParams.minArea = formValues.minArea;
    if (formValues.maxArea) queryParams.maxArea = formValues.maxArea;
    if (formValues.bedrooms) queryParams.bedrooms = formValues.bedrooms;
    if (formValues.bathrooms) queryParams.bathrooms = formValues.bathrooms;
    if (formValues.type) queryParams.type = formValues.type;
    if (formValues.propertyType) queryParams.propertyType = formValues.propertyType;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true // Use replaceUrl to avoid browser history pollution
    });
  }
  
  // UI Helpers
  toggleFilterSection(section: string): void {
    this.isFilterOpen[section] = !this.isFilterOpen[section];
  }
  
  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }
  
  // Format price for display
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price);
  }
  
  // Format area for display
  formatArea(area: number): string {
    return `${area} m²`;
  }
  
  // Helper to get property type display name
  getPropertyTypeDisplay(type: string): string {
    // Return the type as is since it's already properly formatted
    return type;
  }
  
  // Helper to get listing type display name
  getListingTypeDisplay(type: ListingType): string {
    return type === ListingType.SALE ? 'For Sale' : 'For Rent';
  }

  // Helper method to check if any filters are applied
  hasActiveFilters(): boolean {
    const formValues = this.filterForm.getRawValue();
    return !!(
      (formValues.keyword && formValues.keyword.trim()) || 
      (formValues.city && formValues.city.trim()) || 
      formValues.priceMin || 
      formValues.priceMax || 
      formValues.minArea || 
      formValues.maxArea || 
      formValues.bedrooms || 
      formValues.bathrooms || 
      formValues.type || 
      formValues.propertyType
    );
  }

  // Last resort method
  useFinalFallbackMethod(): void {
    console.log('Using final fallback method');
    
    this.propertyApiService.getListingsWithFallback().subscribe({
      next: (listings: ListingResponse[]) => {
        console.log('Fallback listings:', listings);
        this.allPropertiesCache = listings || [];
        
        // Apply any active filters to the results
        if (this.hasActiveFilters()) {
          // Use filterPropertiesLocally which now properly handles empty results
          this.filterPropertiesLocally();
        } else {
          // Use all listings if no filters are active
          this.properties = listings || [];
          this.filteredProperties = listings || [];
          this.totalItems = listings.length;
          this.totalPages = Math.ceil(listings.length / this.itemsPerPage);
          
          // Apply pagination
          const startIndex = (this.currentPage - 1) * this.itemsPerPage;
          const endIndex = startIndex + this.itemsPerPage;
          this.filteredProperties = listings.slice(startIndex, endIndex);
          
          this.isLoading = false;
          this.applyLocalSorting();
        }
        
        if (listings.length === 0 && !this.hasActiveFilters()) {
          this.errorMessage = 'No properties found. Please try again later.';
        }
      },
      error: (error) => {
        console.error('All fallback methods failed:', error);
        this.errorMessage = 'Failed to load properties. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  // New method to load all properties with pagination
  loadAllPropertiesPaged(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    // If there are active filters, we shouldn't be showing all properties
    if (this.hasActiveFilters()) {
      console.log('Active filters detected, but loadAllPropertiesPaged was called');
      // Set empty result since filters are active but we're in the "load all" method
      this.properties = [];
      this.filteredProperties = [];
      this.totalItems = 0;
      this.totalPages = 0;
      this.isLoading = false;
      return;
    }
    
    // Use a smaller page size for faster initial load
    const initialPageSize = 6;
    
    this.propertyApiService.getAllListingsPaged(this.currentPage, initialPageSize).subscribe({
      next: (response: PageDto<ListingResponse>) => {
        if (response && response.items && response.items.length > 0) {
          this.properties = response.items;
          this.filteredProperties = response.items;
          this.totalItems = response.totalElements;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          this.isLoading = false;
          
          // Apply sorting
          this.applyLocalSorting();
          
          // After displaying initial page, load complete page data in background
          // if the requested page size is different than our initial quick load
          if (initialPageSize !== this.itemsPerPage) {
            setTimeout(() => {
              this.loadCompletePageData();
            }, 1000);
          }
        } else {
          this.useFinalFallbackMethod();
        }
      },
      error: (error) => {
        console.error('Error loading paged listings:', error);
        this.useFinalFallbackMethod();
      }
    });
  }
  
  // Helper method to load the complete page data after initial quick loading
  loadCompletePageData(): void {
    this.propertyApiService.getAllListingsPaged(this.currentPage, this.itemsPerPage).subscribe({
      next: (response: PageDto<ListingResponse>) => {
        if (response && response.items && response.items.length > 0) {
          this.properties = response.items;
          this.filteredProperties = response.items;
          this.totalItems = response.totalElements;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
          
          // Apply sorting
          this.applyLocalSorting();
        }
      },
      error: (error) => {
        console.error('Error loading complete page data:', error);
        // No need to show error as we already have initial data
      }
    });
  }

  // Helper method to generate array of page numbers for pagination
  getPageArray(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Clear a specific filter
  clearFilter(filterName: string): void {
    // Reset the specific filter
    this.filterForm.get(filterName)?.setValue(null);
    
    // Update query params and apply filters
    this.currentPage = 1;
    this.updateQueryParams();
    this.applyFilters(true);
  }
  
  // Clear price filter (both min and max)
  clearPriceFilter(): void {
    this.filterForm.patchValue({
      priceMin: null,
      priceMax: null
    });
    
    // Update query params and apply filters
    this.currentPage = 1;
    this.updateQueryParams();
    this.applyFilters(true);
  }
  
  // Clear area filter (both min and max)
  clearAreaFilter(): void {
    this.filterForm.patchValue({
      minArea: null,
      maxArea: null
    });
    
    // Update query params and apply filters
    this.currentPage = 1;
    this.updateQueryParams();
    this.applyFilters(true);
  }
}
