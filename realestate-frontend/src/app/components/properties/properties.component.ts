import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalItems: number = 0;
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  // Sorting
  sortOptions: string[] = ['Newest', 'Price (Low to High)', 'Price (High to Low)', 'Most Popular'];
  selectedSort: string = 'Newest';
  
  // Property Types
  propertyTypes: string[] = ['All Types', 'House', 'Apartment', 'Condo', 'Townhouse', 'Villa', 'Land'];
  
  // Filter Form
  filterForm: FormGroup;
  
  // UI state
  isFilterOpen: { [key: string]: boolean } = {
    propertyType: true,
    priceRange: true,
    bedrooms: true,
    bathrooms: true,
    location: true,
    squareFeet: true
  };
  
  showMobileFilters: boolean = false;
  
  constructor(
    private propertyService: PropertyService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      type: ['All Types'],
      priceMin: [null],
      priceMax: [null],
      beds: ['Any'],
      baths: ['Any'],
      location: [''],
      squareFeetMin: [null],
      squareFeetMax: [null],
      keywords: ['']
    });
  }

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.propertyService.getAllProperties().subscribe({
      next: (properties) => {
        this.properties = properties;
        this.filteredProperties = [...properties];
        this.totalItems = this.filteredProperties.length;
        this.isLoading = false;
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = 'Error loading properties. Please try again.';
        this.isLoading = false;
        console.error('Error fetching properties:', error);
      }
    });
  }

  // Filter Methods
  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredProperties = this.properties.filter(property => {
      // Property Type Filter
      if (filters.type !== 'All Types' && property.type !== filters.type) {
        return false;
      }
      
      // Price Range Filter
      if (filters.priceMin && property.price < filters.priceMin) {
        return false;
      }
      if (filters.priceMax && property.price > filters.priceMax) {
        return false;
      }
      
      // Bedrooms Filter
      if (filters.beds !== 'Any') {
        const bedsValue = parseInt(filters.beds);
        if (filters.beds.includes('+')) {
          if (property.features.bedrooms < bedsValue) return false;
        } else {
          if (property.features.bedrooms !== bedsValue) return false;
        }
      }
      
      // Bathrooms Filter
      if (filters.baths !== 'Any') {
        const bathsValue = parseInt(filters.baths);
        if (filters.baths.includes('+')) {
          if (property.features.bathrooms < bathsValue) return false;
        } else {
          if (property.features.bathrooms !== bathsValue) return false;
        }
      }
      
      // Location Filter
      if (filters.location && !this.matchLocation(property, filters.location)) {
        return false;
      }
      
      // Square Feet Filter
      if (filters.squareFeetMin && property.features.area < filters.squareFeetMin) {
        return false;
      }
      if (filters.squareFeetMax && property.features.area > filters.squareFeetMax) {
        return false;
      }
      
      // Keywords Filter
      if (filters.keywords && !this.matchKeywords(property, filters.keywords)) {
        return false;
      }
      
      return true;
    });
    
    // Apply sorting
    this.applySorting();
    
    // Update pagination
    this.totalItems = this.filteredProperties.length;
    this.currentPage = 1;
  }
  
  matchLocation(property: Property, location: string): boolean {
    location = location.toLowerCase();
    return (
      property.location.address.toLowerCase().includes(location) ||
      property.location.city.toLowerCase().includes(location) ||
      property.location.state.toLowerCase().includes(location) ||
      property.location.zipCode.toLowerCase().includes(location)
    );
  }
  
  matchKeywords(property: Property, keywords: string): boolean {
    keywords = keywords.toLowerCase();
    const keywordArray = keywords.split(' ').filter(k => k.length > 0);
    
    if (keywordArray.length === 0) return true;
    
    for (const keyword of keywordArray) {
      if (
        property.title.toLowerCase().includes(keyword) ||
        property.description.toLowerCase().includes(keyword) ||
        (property.amenities && property.amenities.some(a => a.toLowerCase().includes(keyword)))
      ) {
        return true;
      }
    }
    
    return false;
  }
  
  resetFilters(): void {
    this.filterForm.reset({
      type: 'All Types',
      priceMin: null,
      priceMax: null,
      beds: 'Any',
      baths: 'Any',
      location: '',
      squareFeetMin: null,
      squareFeetMax: null,
      keywords: ''
    });
    
    this.applyFilters();
  }
  
  // Sorting
  applySorting(): void {
    switch (this.selectedSort) {
      case 'Newest':
        // For demo purposes, use a random ordering when date is not available
        // In a real app you would use an actual date property from the model
        this.filteredProperties.sort(() => Math.random() - 0.5);
        break;
      case 'Price (Low to High)':
        this.filteredProperties.sort((a, b) => a.price - b.price);
        break;
      case 'Price (High to Low)':
        this.filteredProperties.sort((a, b) => b.price - a.price);
        break;
      case 'Most Popular':
        // Since we don't have a 'views' property, we'll sort by price as a placeholder
        // In a real application, replace this with proper popularity metrics
        this.filteredProperties.sort((a, b) => b.price - a.price);
        break;
    }
  }
  
  updateSort(option: string): void {
    this.selectedSort = option;
    this.applySorting();
  }
  
  // Pagination
  get paginatedProperties(): Property[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProperties.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  changePage(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // UI Helpers
  toggleFilterSection(section: string): void {
    this.isFilterOpen[section] = !this.isFilterOpen[section];
  }
  
  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }
  
  // Utils
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  }
}
