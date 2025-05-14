import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ListingService } from '../../../../services/listing.service';
import { 
  ListingResponse, 
  ListingRequest, 
  ListingType, 
  ListingStatus, 
  ListingPropertyType,
  ListingImageResponse
} from '../../../../models/listing.model';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-listing-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './admin-listing-edit.component.html',
  styleUrls: ['./admin-listing-edit.component.scss']
})
export class AdminListingEditComponent implements OnInit {
  listingId: string | null = null;
  listing: ListingResponse | null = null;
  listingForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // For image handling
  listingImages: ListingImageResponse[] = [];
  selectedFiles: File[] = [];
  uploadProgress: number = 0;
  isUploading: boolean = false;
  mainImageId: string | null = null;

  // Enums for template
  listingTypes = Object.values(ListingType);
  listingStatuses = Object.values(ListingStatus);
  propertyTypes = Object.values(ListingPropertyType);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService
  ) {
    this.listingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      area: [0, [Validators.required, Validators.min(0)]],
      bedrooms: [0, [Validators.required, Validators.min(0)]],
      bathrooms: [0, [Validators.required, Validators.min(0)]],
      yearBuilt: [0, [Validators.required, Validators.min(1900)]],
      type: [ListingType.SALE, Validators.required],
      status: [ListingStatus.PENDING, Validators.required],
      propertyType: [ListingPropertyType.Apartment, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.listingId = params.get('id');
      
      if (this.listingId) {
        this.loadListing(this.listingId);
      }
    });
  }

  loadListing(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin([
      this.listingService.getListingById(id),
      this.listingService.getListingImages(id)
    ]).subscribe({
      next: ([listing, images]) => {
        this.listing = listing;
        this.listingImages = images;
        
        // Find the main image
        const mainImage = images.find(img => img.imageUrl === listing.image);
        if (mainImage) {
          this.mainImageId = mainImage.id;
        }
        
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
          type: listing.type,
          status: listing.status,
          propertyType: listing.propertyType
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading listing:', error);
        this.errorMessage = 'Failed to load listing details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.listingForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.listingForm.controls).forEach(key => {
        const control = this.listingForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    if (!this.listingId || !this.listing) {
      this.errorMessage = 'Listing ID is required for updating.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    const updateData: ListingRequest = {
      ...this.listingForm.value,
      ownerId: this.listing.ownerId,
      image: this.listing.image || '',
      view: this.listing.view || 0
    };

    this.listingService.updateListing(this.listingId, updateData)
      .subscribe({
        next: (response) => {
          this.successMessage = 'Listing updated successfully!';
          this.isLoading = false;
          // Reload listing to get latest data
          this.loadListing(this.listingId!);
        },
        error: (error) => {
          console.error('Error updating listing:', error);
          this.errorMessage = 'Failed to update listing. Please try again.';
          this.isLoading = false;
        }
      });
  }

  // IMAGE HANDLING METHODS
  onFileSelected(event: any): void {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadImages(): void {
    if (!this.listingId || this.selectedFiles.length === 0) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    this.listingService.uploadMultipleListingImages(this.listingId, this.selectedFiles)
      .pipe(
        finalize(() => {
          this.isUploading = false;
          this.selectedFiles = [];
          // Clear the file input
          const fileInput = document.getElementById('image-upload') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        })
      )
      .subscribe({
        next: (urls) => {
          this.successMessage = `Successfully uploaded ${urls.length} images.`;
          // Reload images
          this.loadListingImages(this.listingId!);
        },
        error: (error) => {
          console.error('Error uploading images:', error);
          this.errorMessage = 'Failed to upload images. Please try again.';
        }
      });
  }

  loadListingImages(listingId: string): void {
    this.listingService.getListingImages(listingId)
      .subscribe({
        next: (images) => {
          this.listingImages = images;
        },
        error: (error) => {
          console.error('Error loading images:', error);
        }
      });
  }

  setAsMainImage(imageId: string): void {
    if (!this.listingId) return;

    this.isLoading = true;
    this.listingService.setMainImage(this.listingId, imageId)
      .pipe(
        switchMap(() => this.listingService.getListingById(this.listingId!)),
        switchMap(listing => {
          // Update the listing's main image
          this.listing = listing;
          this.mainImageId = imageId;
          return this.listingService.getListingImages(this.listingId!);
        })
      )
      .subscribe({
        next: (images) => {
          this.listingImages = images;
          this.successMessage = 'Main image updated successfully.';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error setting main image:', error);
          this.errorMessage = 'Failed to set main image.';
          this.isLoading = false;
        }
      });
  }

  deleteImage(imageId: string): void {
    if (!this.listingId) return;
    
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      this.isLoading = true;
      
      this.listingService.deleteListingImage(imageId, this.listingId)
        .pipe(
          catchError(error => {
            console.error('Error deleting image:', error);
            this.errorMessage = 'Failed to delete image.';
            return of(null);
          }),
          finalize(() => {
            this.loadListingImages(this.listingId!);
            this.isLoading = false;
          })
        )
        .subscribe(() => {
          this.successMessage = 'Image deleted successfully.';
        });
    }
  }

  cancelEdit(): void {
    this.router.navigate(['/admin/listings']);
  }
} 