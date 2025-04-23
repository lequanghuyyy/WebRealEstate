import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-rent',
  templateUrl: './rent.component.html',
  styleUrls: ['./rent.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class RentComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  activeSearchType: string = 'rent';
  totalItems: number = 0;
  
  // Filter form
  filterForm: FormGroup;
  
  // Mobile filter visibility
  mobileFiltersOpen: boolean = false;
  
  // Filter accordion states
  filtersOpen: { [key: string]: boolean } = {
    location: true,
    propertyType: true,
    price: true,
    beds: false,
    baths: false,
    area: false,
    keywords: false
  };
  
  // Property type options
  propertyTypes = [
    { id: 'apartment', label: 'Apartment' },
    { id: 'house', label: 'House' },
    { id: 'villa', label: 'Villa' }
  ];
  
  // Bedroom options
  bedOptions = [
    { id: '1', label: '1 Bedroom' },
    { id: '2', label: '2 Bedrooms' },
    { id: '3', label: '3 Bedrooms' },
    { id: '4', label: '4 Bedrooms' },
    { id: '5+', label: '5+ Bedrooms' }
  ];
  
  // Bathroom options
  bathOptions = [
    { id: '1', label: '1 Bathroom' },
    { id: '2', label: '2 Bathrooms' },
    { id: '3', label: '3 Bathrooms' },
    { id: '4+', label: '4+ Bathrooms' }
  ];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 6;
  totalPages: number = 0;
  
  // Sorting
  sortOptions: string[] = [
    'Newest',
    'Price (Low to High)',
    'Price (High to Low)',
    'Most Popular'
  ];
  
  // Biến lưu trữ sắp xếp đã chọn
  selectedSort: string = 'Newest';
  
  constructor(
    private propertyService: PropertyService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      location: [''],
      propertyType: [''],
      priceMin: [''],
      priceMax: [''],
      beds: [''],
      baths: [''],
      areaMin: [''],
      areaMax: [''],
      keywords: [''],
      sort: ['Newest']
    });
  }
  
  ngOnInit(): void {
    this.loadProperties();
    
    // Đồng bộ giá trị selectedSort với form
    this.selectedSort = this.filterForm.get('sort')?.value || 'Newest';
    
    // Subscribe to form value changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      // Only get rental properties
      this.propertyService.getAllProperties().subscribe({
        next: (properties) => {
          this.properties = properties.filter(p => p.type === 'rent');
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load properties. Please try again later.';
          this.isLoading = false;
          console.error('Error loading properties:', error);
        }
      });
    } catch (error) {
      this.errorMessage = 'An unexpected error occurred. Please try again later.';
      this.isLoading = false;
      console.error('Unexpected error:', error);
    }
  }
  
  applyFilters(): void {
    const formValues = this.filterForm.value;
    
    let filtered = this.properties;
    
    // Filter by location
    if (formValues.location) {
      filtered = filtered.filter(property => 
        property.location.city?.toLowerCase().includes(formValues.location.toLowerCase()) ||
        property.location.state?.toLowerCase().includes(formValues.location.toLowerCase()) ||
        property.location.zipCode?.toLowerCase().includes(formValues.location.toLowerCase())
      );
    }
    
    // Filter by property type
    if (formValues.propertyType) {
      filtered = filtered.filter(property => 
        property.tags && property.tags.some(tag => tag.toLowerCase() === formValues.propertyType.toLowerCase())
      );
    }
    
    // Filter by price range
    if (formValues.priceMin) {
      filtered = filtered.filter(property => property.price >= Number(formValues.priceMin));
    }
    
    if (formValues.priceMax) {
      filtered = filtered.filter(property => property.price <= Number(formValues.priceMax));
    }
    
    // Filter by bedrooms
    if (formValues.beds) {
      filtered = filtered.filter(property => property.features.bedrooms >= Number(formValues.beds));
    }
    
    // Filter by bathrooms
    if (formValues.baths) {
      filtered = filtered.filter(property => property.features.bathrooms >= Number(formValues.baths));
    }
    
    // Filter by area range
    if (formValues.areaMin) {
      filtered = filtered.filter(property => property.features.area >= Number(formValues.areaMin));
    }
    
    if (formValues.areaMax) {
      filtered = filtered.filter(property => property.features.area <= Number(formValues.areaMax));
    }
    
    // Filter by keywords
    if (formValues.keywords) {
      const keywords = formValues.keywords.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(keywords) ||
        property.description.toLowerCase().includes(keywords) ||
        (property.location.address && property.location.address.toLowerCase().includes(keywords)) ||
        (property.amenities && property.amenities.some(amenity => amenity.toLowerCase().includes(keywords)))
      );
    }
    
    // Apply sorting
    switch (formValues.sort) {
      case 'Newest':
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'Price (Low to High)':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price (High to Low)':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'Most Popular':
        // Implement most popular sorting logic
        break;
    }
    
    this.filteredProperties = filtered;
    this.totalItems = filtered.length;
    this.calculatePagination();
    this.currentPage = 1; // Reset to first page after applying filters
  }
  
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProperties.length / this.pageSize);
  }
  
  getPaginatedProperties(): Property[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredProperties.slice(startIndex, startIndex + this.pageSize);
  }
  
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPageNumbers(): number[] {
    const pages = [];
    const totalPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(totalPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + totalPagesToShow - 1);
    
    if (endPage - startPage + 1 < totalPagesToShow) {
      startPage = Math.max(1, endPage - totalPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  toggleMobileFilters(): void {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }
  
  toggleFilter(section: string): void {
    this.filtersOpen[section] = !this.filtersOpen[section];
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      location: '',
      propertyType: '',
      priceMin: '',
      priceMax: '',
      beds: '',
      baths: '',
      areaMin: '',
      areaMax: '',
      keywords: '',
      sort: 'Newest'
    });
    this.applyFilters();
  }
  
  applyFiltersAction(): void {
    this.applyFilters();
    if (this.mobileFiltersOpen) {
      this.toggleMobileFilters();
    }
  }
  
  formatPrice(price: number): string {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  }
  
  retryLoading(): void {
    this.loadProperties();
  }

  setSearchType(keyword: string): void {
    this.activeSearchType = keyword;
    // Navigate to the correct page based on search type
    if (keyword === 'buy') {
      this.router.navigate(['/buy']);
    } else if (keyword === 'sell') {
      this.router.navigate(['/listing']);
    } else {
      this.router.navigate(['/rent']);
    }
  }

  viewPropertyDetails(id: string | number): void {
    this.router.navigate(['/property', id]);
  }

  toggleFavorite(event: Event, propertyId: string | number): void {
    event.stopPropagation(); // Prevent triggering card click
    // In a real app, this would toggle favorite status in the database
    console.log('Toggle favorite for property:', propertyId);
    // You could update UI here if needed
  }

  trackById(index: number, item: any): string | number {
    return item.id;
  }

  // Search method for the search input
  searchLocation(location: string): void {
    this.filterForm.patchValue({ location });
    this.applyFilters();
  }

  // Cập nhật phương thức sắp xếp
  updateSort(option: string): void {
    this.selectedSort = option;
    this.filterForm.get('sort')?.setValue(option);
    this.applyFilters();
  }
} 