import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { Agent } from '../../models/agent.model';
import { Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyReviewsComponent } from '../property-reviews/property-reviews.component';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { ToastrWrapperService } from '../../services/toastr-wrapper.service';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PropertyReviewsComponent]
})
export class PropertyDetailsComponent implements OnInit {
  // Private injections
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private favoriteService = inject(FavoriteService);
  private toastr = inject(ToastrWrapperService);
  private fb = inject(FormBuilder);
  
  // Component properties
  propertyId: string | null = null;
  property: Property | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  activeImageIndex: number = 0;
  contactForm: FormGroup;
  scheduleForm: FormGroup;
  formSubmitted: boolean = false;
  scheduleSubmitted: boolean = false;
  similarProperties: Property[] = [];
  searchType: 'buy' | 'rent' | 'sell' = 'buy';
  
  // Form visibility states
  showContactForm: boolean = false;
  showScheduleForm: boolean = false;

  // User authentication
  isAuthenticated: boolean = false;
  userId: string | null = null;
  
  // Favorite status
  isFavorite: boolean = false;

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9\s\-\(\)]{10,15}$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      newsletter: [false]
    });

    this.scheduleForm = this.fb.group({
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      notes: [''],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9\s\-\(\)]{10,15}$/)]],
      meetingType: ['', [Validators.required]],
      meetingLocation: ['']
    });
  }

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    this.loadProperty();
    this.checkAuthStatus();
    
    // Monitor route changes to reload property data
    this.route.params.subscribe(params => {
      const newPropertyId = params['id'];
      if (newPropertyId && newPropertyId !== this.propertyId) {
        this.propertyId = newPropertyId;
        this.loadProperty();
      }
    });
  }
  
  private checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userId = user.id;
        if (this.propertyId) {
          this.checkFavoriteStatus();
        }
      }
    } else {
      this.isAuthenticated = false;
      this.userId = null;
    }
  }

  private loadProperty(): void {
    if (!this.propertyId) {
      this.errorMessage = 'Property ID is missing';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.propertyService.getPropertyById(this.propertyId).subscribe({
      next: (response: any) => {
        this.property = response;
        this.isLoading = false;
        
        if (this.property) {
          // Safe call to loadSimilarProperties with a null check
          this.loadSimilarProperties(this.property);
          
          // Update page title with property name
          document.title = `${this.property?.title} | Real Estate`;
          
          if (this.isAuthenticated && this.userId) {
            this.checkFavoriteStatus();
          }
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load property details';
        this.isLoading = false;
      }
    });
  }

  private checkFavoriteStatus(): void {
    if (this.userId && this.propertyId) {
      this.favoriteService.checkIsFavorite(this.userId, this.propertyId).subscribe(isFavorite => {
        this.isFavorite = isFavorite;
      });
    }
  }

  toggleFavorite(): void {
    if (!this.isAuthenticated) {
      this.toastr.warning('Please login to save properties to favorites');
      return;
    }

    if (!this.userId || !this.propertyId) {
      this.toastr.error('Unable to process favorite action');
      return;
    }

    if (this.isFavorite) {
      this.favoriteService.removeFavorite(this.userId, this.propertyId).subscribe({
        next: () => {
          this.isFavorite = false;
          this.toastr.success('Removed from favorites');
        },
        error: (error) => {
          this.toastr.error('Failed to remove from favorites');
        }
      });
    } else {
      this.favoriteService.addFavorite(this.userId, this.propertyId).subscribe({
        next: () => {
          this.isFavorite = true;
          this.toastr.success('Added to favorites');
        },
        error: (error) => {
          this.toastr.error('Failed to add to favorites');
        }
      });
    }
  }

  loadSimilarProperties(property: Property): void {
    // Fetch similar properties based on current property
    this.propertyService.getSimilarProperties(
      property.id, 
      property.type, 
      4 // Pass a number as the limit parameter
    ).subscribe({
      next: (properties: Property[]) => {
        this.similarProperties = properties.slice(0, 4); // Limit to 4 similar properties
      },
      error: (error: any) => {
        console.error('Error loading similar properties:', error);
        // No need to show error to user for this feature
      }
    });
  }

  handleError(message: string): void {
    this.errorMessage = message;
    this.isLoading = false;
  }

  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }

  nextImage(): void {
    if (this.property && this.property.images) {
      this.activeImageIndex = (this.activeImageIndex + 1) % this.property.images.length;
    }
  }

  prevImage(): void {
    if (this.property && this.property.images) {
      this.activeImageIndex = this.activeImageIndex === 0 
        ? this.property.images.length - 1 
        : this.activeImageIndex - 1;
    }
  }

  submitContactForm(): void {
    this.formSubmitted = true;
    
    if (this.contactForm.valid && this.property) {
      const formData = {
        ...this.contactForm.value,
        propertyId: this.property.id,
        propertyTitle: this.property.title,
        agentId: this.property.agent.id
      };

      this.propertyService.submitContactRequest(formData).subscribe({
        next: () => {
          // Handle success
          this.contactForm.reset();
          this.formSubmitted = false;
          this.toastr.success('Your message has been sent successfully!');
        },
        error: (error: any) => {
          console.error('Error submitting contact form:', error);
          this.toastr.error('Failed to send message. Please try again later.');
        }
      });
    }
  }

  submitScheduleForm(): void {
    if (this.scheduleForm.invalid) {
      Object.keys(this.scheduleForm.controls).forEach(key => {
        this.scheduleForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (!this.property) {
      this.toastr.error('Property information is missing');
      return;
    }

    this.scheduleSubmitted = true;

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.toastr.error('User information is missing');
      return;
    }

    // Prepare form data in a way that the AppointmentService can understand
    const formData = {
      propertyId: this.property.id,
      buyerId: user.id,
      agentId: this.property.agent.id,
      appointmentDate: this.scheduleForm.get('date')?.value,
      appointmentTime: this.scheduleForm.get('time')?.value,
      meetingType: this.scheduleForm.get('meetingType')?.value,
      meetingLocation: this.scheduleForm.get('meetingType')?.value === 'in-person' ? 
        this.property.location.address : undefined,
      notes: this.scheduleForm.get('notes')?.value
    };

    this.appointmentService.createAppointment(formData).subscribe({
      next: () => {
        this.toggleScheduleForm();
        this.scheduleForm.reset();
        this.scheduleSubmitted = false;
        this.toastr.success('Viewing request sent! The agent will contact you to confirm.');
      },
      error: (error) => {
        console.error('Error scheduling viewing:', error);
        this.toastr.error('Unable to schedule a viewing. Please try again later.');
        this.scheduleSubmitted = false;
      }
    });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  retryLoading(): void {
    if (this.propertyId) {
      this.loadProperty();
    }
  }

  setSearchType(type: 'buy' | 'rent' | 'sell'): void {
    this.searchType = type;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  }

  getGoogleMapsUrl(): string {
    if (!this.property || !this.property.location) return '';
    
    const address = encodeURIComponent(
      `${this.property.location.address}, ${this.property.location.city}, ${this.property.location.state}, ${this.property.location.zipCode}`
    );
    
    return `https://www.google.com/maps?q=${address}`;
  }

  getAmenityIcon(amenity: string): string {
    // Convert amenity to lowercase for case-insensitive matching
    const amenityLower = amenity.toLowerCase();
    
    if (amenityLower.includes('pool')) return 'fas fa-swimming-pool';
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return 'fas fa-dumbbell';
    if (amenityLower.includes('parking') || amenityLower.includes('garage')) return 'fas fa-car';
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return 'fas fa-wifi';
    if (amenityLower.includes('balcony') || amenityLower.includes('terrace')) return 'fas fa-door-open';
    if (amenityLower.includes('ac') || amenityLower.includes('air') || amenityLower.includes('conditioning')) return 'fas fa-snowflake';
    if (amenityLower.includes('heating')) return 'fas fa-temperature-high';
    if (amenityLower.includes('elevator') || amenityLower.includes('lift')) return 'fas fa-arrow-alt-circle-up';
    if (amenityLower.includes('security') || amenityLower.includes('guard')) return 'fas fa-shield-alt';
    if (amenityLower.includes('pet') || amenityLower.includes('dog') || amenityLower.includes('cat')) return 'fas fa-paw';
    if (amenityLower.includes('laundry') || amenityLower.includes('washer')) return 'fas fa-tshirt';
    if (amenityLower.includes('tv') || amenityLower.includes('cable')) return 'fas fa-tv';
    if (amenityLower.includes('furniture') || amenityLower.includes('furnished')) return 'fas fa-couch';
    if (amenityLower.includes('garden') || amenityLower.includes('yard')) return 'fas fa-leaf';
    if (amenityLower.includes('grill') || amenityLower.includes('bbq')) return 'fas fa-fire';
    
    // Default icon if no match is found
    return 'fas fa-check-circle';
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || 
      (fieldName === 'name' && this.formSubmitted) || 
      (fieldName === 'email' && this.formSubmitted) ||
      (fieldName === 'phone' && this.formSubmitted) ||
      (fieldName === 'message' && this.formSubmitted) ||
      (fieldName === 'date' && this.scheduleSubmitted) ||
      (fieldName === 'time' && this.scheduleSubmitted)
    ));
  }

  selectTimeSlot(time: string): void {
    this.scheduleForm.patchValue({ time });
    
    // Xóa class selected cho tất cả các nút time slot
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
      slot.classList.remove('selected');
    });
    
    // Thêm class selected cho nút được chọn
    const selectedSlot = Array.from(timeSlots).find(slot => 
      (slot as HTMLElement).innerText.trim() === time
    );
    if (selectedSlot) {
      selectedSlot.classList.add('selected');
    }
  }

  toggleScheduleForm(): void {
    this.showScheduleForm = !this.showScheduleForm;
    
    // If opening schedule form, close contact form
    if (this.showScheduleForm) {
      this.showContactForm = false;
    }
  }
} 