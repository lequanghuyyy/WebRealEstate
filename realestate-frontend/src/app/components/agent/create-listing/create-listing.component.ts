import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyApiService } from '../../../services/property-api.service';
import { AuthService } from '../../../services/auth.service';
import { Property } from '../../../models/property.model';
import { UserAdapters } from '../../../utils/user-adapters';
import { ListingRequest, ListingType, ListingPropertyType } from '../../../models/listing.model';

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
  
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  maxImages: number = 10;
  
  propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' }
  ];
  
  statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'pending', label: 'Pending' },
    { value: 'sold', label: 'Sold' },
    { value: 'rented', label: 'Rented' }
  ];

  constructor(
    private fb: FormBuilder,
    private propertyApiService: PropertyApiService,
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
      yearBuilt: [null, [Validators.min(1900), Validators.max(new Date().getFullYear())]],
      type: ['sale', Validators.required],
      status: ['available', Validators.required],
      style: ['house', Validators.required],
      tags: [[]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || !this.authService.isAgent()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    
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
    
    this.propertyApiService.getListingById(id).subscribe({
      next: (listing) => {
        this.listingForm.patchValue({
          title: listing.title,
          description: listing.description,
          address: listing.address,
          city: listing.city,
          price: listing.price,
          area: listing.area,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          yearBuilt: listing.yearBuilt,
          type: listing.type === 'SALE' ? 'sale' : 'rent',
          status: listing.status.toLowerCase(),
          style: listing.propertyType.toLowerCase(),
          tags: []
        });
        
        // If listing has an image, show it in the preview
        if (listing.image && listing.image.trim() !== '') {
          this.imagePreviewUrls = [listing.image];
        } else {
          // Clear any existing previews if the listing has no image
          this.imagePreviewUrls = [];
          this.selectedImages = [];
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
      Object.keys(this.listingForm.controls).forEach(key => {
        this.listingForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.authService.isAgent()) {
      this.errorMessage = 'You must be logged in as an agent to create a listing.';
      this.isSubmitting = false;
      return;
    }
    
    this.isSubmitting = true;
    
    const formValue = this.listingForm.value;
    
    // For image: 
    // - For new listings: If no image, send empty string
    // - For editing: If no new image selected, send empty string and let backend handle keeping the existing image
    const imageToUse = this.imagePreviewUrls.length > 0 ? this.imagePreviewUrls[0] : '';
    
    const listingRequest: ListingRequest = {
      title: formValue.title,
      description: formValue.description,
      address: formValue.address,
      city: formValue.city,
      image: imageToUse,
      price: formValue.price,
      area: formValue.area,
      bedrooms: formValue.bedrooms || 0,
      bathrooms: formValue.bathrooms || 0,
      yearBuilt: formValue.yearBuilt || new Date().getFullYear(),
      type: formValue.type === 'sale' ? ListingType.SALE : ListingType.RENT,
      propertyType: this.mapPropertyType(formValue.style),
      ownerId: currentUser.id
    };
    
    if (this.editMode && this.listingId) {
      this.propertyApiService.updateListing(this.listingId, listingRequest).subscribe({
        next: (updatedListing) => {
          this.isSubmitting = false;
          this.successMessage = 'Property listing updated successfully!';
          
          setTimeout(() => {
            this.router.navigate(['/property', updatedListing.id]);
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating property:', error);
          this.errorMessage = 'Failed to update property. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.propertyApiService.createListing(listingRequest).subscribe({
        next: (newListing) => {
          this.isSubmitting = false;
          this.successMessage = 'Property listing created successfully!';
          
          setTimeout(() => {
            this.router.navigate(['/property', newListing.id]);
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

    private mapPropertyType(style: string): ListingPropertyType {
    switch (style.toLowerCase()) {
      case 'house':
        return ListingPropertyType.House;
      case 'apartment':
        return ListingPropertyType.Apartment;
      case 'villa':
        return ListingPropertyType.Villa;
      default:
        return ListingPropertyType.House;
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
} 