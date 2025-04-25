import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class BuyComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  paginatedProperties: Property[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  totalItems: number = 0;
  
  // Filter form
  filterForm: FormGroup;
  
  // Mobile filter visibility
  showMobileFilters: boolean = false;
  
  // Filter accordion states
  isFilterOpen: { [key: string]: boolean } = {
    location: true,
    propertyType: true,
    priceRange: true,
    bedrooms: false,
    bathrooms: false,
    area: false,
    keywords: false
  };
  
  // Property types
  propertyTypes: string[] = [
    'Apartment',
    'House',
    'Villa'
  ];
  
  // Bedrooms options
  bedroomsOptions: string[] = [
    '1',
    '2',
    '3',
    '4',
    '5+'
  ];
  
  // Bathrooms options
  bathroomsOptions: string[] = [
    '1',
    '2',
    '3',
    '4+'
  ];
  
  // Sort options
  sortOptions: string[] = [
    'Newest',
    'Price (Low to High)',
    'Price (High to Low)',
    'Most Popular'
  ];
  selectedSort: string = 'Newest';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  
  constructor(
    private propertyService: PropertyService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      location: [''],
      propertyType: [''],
      minPrice: [''],
      maxPrice: [''],
      bedrooms: [''],
      bathrooms: [''],
      minArea: [''],
      maxArea: [''],
      keywords: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadProperties();
    
    // Subscribe to form value changes for auto-filtering
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }
  
  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get only buy properties
    this.propertyService.getAllProperties().subscribe({
      next: (properties) => {
        this.properties = properties.filter(p => p.type === 'buy');
        this.filteredProperties = [...this.properties];
        this.totalItems = this.filteredProperties.length;
        this.calculateTotalPages();
        this.updatePaginatedProperties();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load properties. Please try again later.';
        this.isLoading = false;
        console.error('Error loading properties:', error);
      }
    });
  }
  
  applyFilters(): void {
    const formValues = this.filterForm.value;
    let filtered = [...this.properties];
    
    // Filter by location
    if (formValues.location) {
      const locationSearch = formValues.location.toLowerCase();
      filtered = filtered.filter(property => 
        property.location.city?.toLowerCase().includes(locationSearch) ||
        property.location.state?.toLowerCase().includes(locationSearch) ||
        property.location.zipCode?.toLowerCase().includes(locationSearch) ||
        property.location.address?.toLowerCase().includes(locationSearch)
      );
    }
    
    // Filter by property type
    if (formValues.propertyType) {
      filtered = filtered.filter(property => 
        property.tags && property.tags.some(tag => 
          tag.toLowerCase() === formValues.propertyType.toLowerCase()
        )
      );
    }
    
    // Filter by price range
    if (formValues.minPrice) {
      filtered = filtered.filter(property => 
        property.price >= Number(formValues.minPrice)
      );
    }
    
    if (formValues.maxPrice) {
      filtered = filtered.filter(property => 
        property.price <= Number(formValues.maxPrice)
      );
    }
    
    // Filter by bedrooms
    if (formValues.bedrooms) {
      const bedCount = formValues.bedrooms === '5+' ? 5 : Number(formValues.bedrooms);
      filtered = filtered.filter(property => {
        if (formValues.bedrooms === '5+') {
          return property.features.bedrooms >= bedCount;
        }
        return property.features.bedrooms === bedCount;
      });
    }
    
    // Filter by bathrooms
    if (formValues.bathrooms) {
      const bathCount = formValues.bathrooms === '4+' ? 4 : Number(formValues.bathrooms);
      filtered = filtered.filter(property => {
        if (formValues.bathrooms === '4+') {
          return property.features.bathrooms >= bathCount;
        }
        return property.features.bathrooms === bathCount;
      });
    }
    
    // Filter by area
    if (formValues.minArea) {
      filtered = filtered.filter(property => 
        property.features.area >= Number(formValues.minArea)
      );
    }
    
    if (formValues.maxArea) {
      filtered = filtered.filter(property => 
        property.features.area <= Number(formValues.maxArea)
      );
    }
    
    // Filter by keywords
    if (formValues.keywords) {
      const keywords = formValues.keywords.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(keywords) ||
        property.description.toLowerCase().includes(keywords) ||
        (property.amenities && property.amenities.some(amenity => 
          amenity.toLowerCase().includes(keywords)
        ))
      );
    }
    
    // Apply sorting based on selected option
    this.applySorting(filtered);
    
    this.filteredProperties = filtered;
    this.totalItems = filtered.length;
    this.calculateTotalPages();
    this.currentPage = 1; // Reset to first page
    this.updatePaginatedProperties();
  }
  
  applySorting(properties: Property[]): void {
    switch (this.selectedSort) {
      case 'Newest':
        properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'Price (Low to High)':
        properties.sort((a, b) => a.price - b.price);
        break;
      case 'Price (High to Low)':
        properties.sort((a, b) => b.price - a.price);
        break;
      case 'Most Popular':
        // In a real app, this would sort based on views or favorites count
        properties.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        break;
    }
  }
  
  updateSort(option: string): void {
    this.selectedSort = option;
    this.applySorting(this.filteredProperties);
    this.updatePaginatedProperties();
  }
  
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);
  }
  
  updatePaginatedProperties(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredProperties.length);
    this.paginatedProperties = this.filteredProperties.slice(startIndex, endIndex);
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedProperties();
    }
  }
  
  getPageArray(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show ellipsis logic
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
  
  toggleFilterSection(section: string): void {
    this.isFilterOpen[section] = !this.isFilterOpen[section];
  }
  
  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }
  
  resetFilters(): void {
    this.filterForm.reset();
    this.filteredProperties = [...this.properties];
    this.totalItems = this.properties.length;
    this.calculateTotalPages();
    this.currentPage = 1;
    this.updatePaginatedProperties();
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  viewPropertyDetails(id: string | number): void {
    this.router.navigate(['/property', id]);
  }
  
  toggleFavorite(event: Event, property: Property): void {
    event.stopPropagation(); // Prevent card click
    property.isFavorite = !property.isFavorite;
    console.log(`Property ${property.id} favorite status: ${property.isFavorite}`);
    // In a real app, you would update this in a service/database
  }
} 