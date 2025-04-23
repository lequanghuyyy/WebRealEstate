import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../../services/property.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.component.html',
  styleUrls: ['./create-listing.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule]
})
export class CreateListingComponent implements OnInit {
  listingForm: FormGroup;
  editMode: boolean = false;
  listingId: string | null = null;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // For image upload
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  maxImages: number = 10;
  
  // Property type options
  propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'office', label: 'Office' }
  ];
  
  // Listing status options
  statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'pending', label: 'Pending' },
    { value: 'sold', label: 'Sold' },
    { value: 'rented', label: 'Rented' }
  ];
  
  // Property tags options
  tagOptions = [
    { value: 'new', label: 'New' },
    { value: 'featured', label: 'Featured' },
    { value: 'hot deal', label: 'Hot Deal' },
    { value: 'modern', label: 'Modern' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'pet friendly', label: 'Pet Friendly' },
    { value: 'family friendly', label: 'Family Friendly' },
    { value: 'eco friendly', label: 'Eco Friendly' },
    { value: 'investment', label: 'Investment' }
  ];

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.listingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      area: [null, [Validators.required, Validators.min(1)]],
      bedrooms: [null, [Validators.min(0)]],
      bathrooms: [null, [Validators.min(0)]],
      type: ['sale', Validators.required],
      status: ['available', Validators.required],
      style: ['house', Validators.required],
      tags: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if user is logged in and is an agent
    if (!this.authService.isLoggedIn() || !this.authService.isAgent()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
    // Check if we're in edit mode (URL has an ID parameter)
    this.route.paramMap.subscribe(params => {
      this.listingId = params.get('id');
      
      if (this.listingId) {
        this.editMode = true;
        this.loadListingData(this.listingId);
      }
    });
  }
  
  loadListingData(id: string): void {
    this.isLoading = true;
    
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        // Populate the form with property data
        this.listingForm.patchValue({
          title: property.title,
          description: property.description,
          address: property.location.address,
          city: property.location.city,
          price: property.price,
          area: property.features.area,
          bedrooms: property.features.bedrooms,
          bathrooms: property.features.bathrooms,
          type: property.type,
          status: property.status,
          style: property.type.toLowerCase(),
          tags: property.tags || []
        });
        
        // Load images if any
        if (property.images && property.images.length > 0) {
          this.imagePreviewUrls = property.images;
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.errorMessage = 'Failed to load property details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.listingForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.listingForm.controls).forEach(key => {
        this.listingForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    // Prepare property data from form
    const formValue = this.listingForm.value;
    const propertyData = {
      title: formValue.title,
      description: formValue.description,
      location: {
        address: formValue.address,
        city: formValue.city,
        state: 'TX', // Default state
        zipCode: '', // Default empty
        country: 'USA' // Default country
      },
      price: formValue.price,
      type: formValue.style, // Using style as the property type
      status: formValue.status,
      features: {
        area: formValue.area,
        bedrooms: formValue.bedrooms,
        bathrooms: formValue.bathrooms,
        yearBuilt: 2020 // Default year
      },
      images: this.imagePreviewUrls,
      amenities: [], // Required field, empty array
      agent: this.authService.getCurrentUser(),
      tags: formValue.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (this.editMode && this.listingId) {
      // Update existing property
      this.propertyService.updateProperty(this.listingId, propertyData).subscribe({
        next: (updatedProperty) => {
          this.isSubmitting = false;
          this.successMessage = 'Property listing updated successfully!';
          
          // Redirect to property details page after a short delay
          setTimeout(() => {
            this.router.navigate(['/property', updatedProperty.id]);
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating property:', error);
          this.errorMessage = 'Failed to update property. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new property
      this.propertyService.createProperty(propertyData).subscribe({
        next: (newProperty) => {
          this.isSubmitting = false;
          this.successMessage = 'Property listing created successfully!';
          
          // Redirect to property details page after a short delay
          setTimeout(() => {
            this.router.navigate(['/property', newProperty.id]);
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating property:', error);
          this.errorMessage = 'Failed to create property. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }
  
  // Handle image selection
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const files = Array.from(input.files);
    
    // Check if adding these files would exceed the maximum
    if (this.selectedImages.length + files.length > this.maxImages) {
      alert(`You can only upload a maximum of ${this.maxImages} images.`);
      return;
    }
    
    // Process each selected file
    files.forEach(file => {
      // Only accept images
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files.');
        return;
      }
      
      this.selectedImages.push(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrls.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset the input
    input.value = '';
  }
  
  // Remove an image from the selection
  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }
  
  // Cancel and go back
  cancel(): void {
    // If we're editing, go back to the property details
    if (this.editMode && this.listingId) {
      this.router.navigate(['/property', this.listingId]);
    } else {
      // Otherwise go to the agent dashboard
      this.router.navigate(['/agent/dashboard']);
    }
  }

  // Toggle tag selection
  toggleTag(tagValue: string): void {
    const tagsControl = this.listingForm.get('tags');
    if (!tagsControl) return;
    
    const currentTags = [...(tagsControl.value || [])];
    const tagIndex = currentTags.indexOf(tagValue);
    
    if (tagIndex > -1) {
      // Tag exists, remove it
      currentTags.splice(tagIndex, 1);
    } else {
      // Tag doesn't exist, add it
      currentTags.push(tagValue);
    }
    
    tagsControl.setValue(currentTags);
    tagsControl.markAsTouched();
  }
  
  // Check if a tag is selected
  isTagSelected(tagValue: string): boolean {
    const tagsControl = this.listingForm.get('tags');
    return tagsControl?.value?.includes(tagValue) || false;
  }
} 