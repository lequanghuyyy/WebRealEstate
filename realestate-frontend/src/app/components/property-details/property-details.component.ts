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
import { ListingService } from '../../services/listing.service';
import { ListingImageResponse } from '../../models/listing.model';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { DefaultImageDirective } from '../../utils/default-image.directive';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/auth.model';
import { OfferService } from '../../services/offer.service';
import { OfferRequest } from '../../models/offer.model';

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PropertyReviewsComponent, DefaultImageDirective]
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
  private listingService = inject(ListingService);
  private userService = inject(UserService);
  private offerService = inject(OfferService);
  
  // Component properties
  propertyId: string | null = null;
  property: Property | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  activeImageIndex: number = 0;
  contactForm: FormGroup;
  scheduleForm: FormGroup;
  offerForm: FormGroup;
  formSubmitted: boolean = false;
  scheduleSubmitted: boolean = false;
  offerSubmitted: boolean = false;
  similarProperties: Property[] = [];
  searchType: 'buy' | 'rent' | 'sell' = 'buy';
  today: string = new Date().toISOString().split('T')[0];
  
  // Form visibility states
  showContactForm: boolean = false;
  showScheduleForm: boolean = false;
  showOfferForm: boolean = false;

  // User authentication
  isAuthenticated: boolean = false;
  userId: string | null = null;
  isAgent: boolean = false;
  
  // Favorite status
  isFavorite: boolean = false;
  
  // Listing images
  listingImages: ListingImageResponse[] = [];

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
      notes: ['']
    });

    this.offerForm = this.fb.group({
      offerPrice: ['', [Validators.required, Validators.min(1)]],
      message: [''],
      expiresAt: ['', [Validators.required]],
      startDate: [''],
      endDate: ['']
    });
  }

  ngOnInit(): void {
    this.checkAuthStatus();
    
    this.propertyId = this.route.snapshot.paramMap.get('id');
    this.loadProperty();
  
    this.favoriteService.favorites$.subscribe((favoriteIds: string[]) => {
      if (this.propertyId && favoriteIds.includes(this.propertyId)) {
        this.isFavorite = true;
      }
    });
    
    this.scheduleForm.get('date')?.setValue(this.today);
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.offerForm.get('expiresAt')?.setValue(expiryDate.toISOString().split('T')[0]);
    
    this.route.params.subscribe(params => {
      const newPropertyId = params['id'];
      if (newPropertyId && newPropertyId !== this.propertyId) {
        this.propertyId = newPropertyId;
        this.loadProperty();
      }
    });
  }
  
  // Thêm hàm tiền tải ảnh để cải thiện trải nghiệm người dùng
  private preloadImages(imageUrls: (string | ListingImageResponse)[]): void {
    // Convert complex image objects to URLs if needed
    const urls = imageUrls.map(img => {
      if (typeof img === 'string') {
        return img;
      } else if (img && 'imageUrl' in img) {
        return img.imageUrl;
      }
      return '';
    }).filter(url => url); // Filter out empty strings
    
    // Preload images
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }
  
  private checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userId = user.id;
        this.isAgent = this.authService.isAgent();
        if (this.propertyId) {
          this.checkFavoriteStatus();
        }
      }
    } else {
      this.isAuthenticated = false;
      this.userId = null;
      this.isAgent = false;
    }
  }

  private loadProperty(): void {
    if (!this.propertyId) {
      this.errorMessage = 'Property ID is missing';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    
    // Parallel requests for property details, main image and all images
    forkJoin({
      propertyDetails: this.propertyService.getPropertyById(this.propertyId).pipe(
        catchError(error => {
          console.error('Error loading property details:', error);
          return of(null);
        })
      ),
      mainImageUrl: this.listingService.getMainImageUrl(this.propertyId).pipe(
        catchError(error => {
          console.error('Error loading main image URL:', error);
          return of('assets/images/property-1.jpg');
        })
      ),
      listingImages: this.listingService.getListingImages(this.propertyId).pipe(
        catchError(error => {
          console.error('Error loading listing images:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (results) => {
        this.property = results.propertyDetails;
        this.listingImages = results.listingImages;
        
        // If we have images from the listing API, update the property images
        if (this.listingImages && this.listingImages.length > 0) {
          if (!this.property) {
            this.property = {} as Property;
          }
          
          // Create/update the images array with all image URLs from Cloudinary
          this.property.images = this.listingImages.map(img => img.imageUrl);
          
          // If we have a main image URL, make sure it's the first in the array
          if (results.mainImageUrl && results.mainImageUrl !== 'assets/images/property-1.jpg') {
            // Find the index of the main image in the array
            const mainImgIndex = this.property.images.findIndex(url => url === results.mainImageUrl);
            if (mainImgIndex > 0) {
              // Move the main image to the beginning of the array
              const mainImg = this.property.images.splice(mainImgIndex, 1)[0];
              this.property.images.unshift(mainImg);
            }
          }
        
          this.preloadImages(this.property.images);
        } else if (this.property && (!this.property.images || this.property.images.length === 0)) {
          // If no images are available, set a default image
          this.property.images = ['assets/images/property-1.jpg'];
        }
        
        // Load agent information if we have a property with an ownerId
        if (this.property && this.property.agent && this.property.agent.id) {
          this.userService.getUserById(this.property.agent.id.toString())
            .pipe(
              catchError(error => {
                console.warn('Could not load agent details:', error);
                // Return default agent info on error instead of propagating the error
                return of({
                  id: this.property?.agent.id || '',
                  firstName: 'Real Estate',
                  lastName: 'Agent',
                  email: 'contact@realestate.com',
                  phone: '123-456-7890',
                  photo: 'assets/images/agent-placeholder.jpg',
                  avatarImg: 'assets/images/agent-placeholder.jpg',
                  roles: ['AGENT']
                });
              })
            )
            .subscribe({
              next: (userResponse) => {
                // Update agent information with real user data
                if (this.property && this.property.agent) {
                  this.property.agent.name = userResponse.firstName + ' ' + userResponse.lastName || 'Agent';
                  this.property.agent.email = userResponse.email || 'agent@example.com';
                  this.property.agent.phone = userResponse.phone || '123-456-7890';
                  
                  // If user has a profile image, use it
                  // First check avatarImg, then photo from userResponse
                  if (userResponse.avatarImg) {
                    this.property.agent.photo = userResponse.avatarImg;
                    console.log('Using agent avatarImg:', userResponse.avatarImg);
                  } else if (userResponse.photo) {
                    this.property.agent.photo = userResponse.photo;
                    console.log('Using agent photo:', userResponse.photo);
                  } else {
                    // If no photo found, use default
                    this.property.agent.photo = 'assets/images/agent-placeholder.jpg';
                    console.log('Using default agent photo');
                  }
                  
                  // Get role/title
                  if (userResponse.roles && userResponse.roles.includes('AGENT')) {
                    this.property.agent.title = 'Licensed Real Estate Agent';
                  }
                }
              },
              complete: () => {
                this.isLoading = false;
              }
            });
        } else {
          this.isLoading = false;
        }
        
        if (this.property) {
          // Load similar properties and check favorite status
          this.loadSimilarProperties(this.property);
          document.title = `${this.property?.title || 'Property Details'} | Real Estate`;
          
          if (this.isAuthenticated && this.userId) {
            this.checkFavoriteStatus();
          }
        } else {
          this.errorMessage = 'Property not found';
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
      console.log('Checking favorite status for property:', this.propertyId);
      
      // Sử dụng phương thức cải tiến
      this.favoriteService.checkIsFavorite(this.userId, this.propertyId).subscribe({
        next: (isFavorite) => {
          console.log('Favorite status:', isFavorite);
          this.isFavorite = isFavorite;
        },
        error: (error) => {
          console.error('Error checking favorite status:', error);
          this.isFavorite = false;
        }
      });
    }
  }

  toggleFavorite(): void {
    if (!this.isAuthenticated) {
      // Redirect to login page with return URL to this property
      this.toastr.warning('Please login to save properties to favorites');
      this.router.navigate(['/login'], { 
        queryParams: { redirect: `/property/${this.propertyId}` } 
      });
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
          console.error('Error removing favorite:', error);
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
          console.error('Error adding favorite:', error);
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
    if (index === this.activeImageIndex) return; // Không làm gì nếu ảnh đã được chọn
    
    // Thêm hiệu ứng mờ đi trước khi chuyển ảnh
    const mainImage = document.querySelector('.main-image') as HTMLElement;
    if (mainImage) {
      // Thêm class để tạo hiệu ứng mờ
      mainImage.style.opacity = '0.5';
      mainImage.style.transition = 'opacity 0.2s ease';
      
      // Sau khi mờ, thì mới đổi ảnh và hiện lại
      setTimeout(() => {
        this.activeImageIndex = index;
        
        // Sau khi đổi ảnh, cho hiện lại
        setTimeout(() => {
          mainImage.style.opacity = '1';
        }, 50);
      }, 200);
    } else {
      // Fallback nếu không tìm thấy element
      this.activeImageIndex = index;
    }
  }

  nextImage(): void {
    if (this.property && this.property.images) {
      const newIndex = (this.activeImageIndex + 1) % this.property.images.length;
      this.setActiveImage(newIndex);
    }
  }

  prevImage(): void {
    if (this.property && this.property.images) {
      const newIndex = this.activeImageIndex === 0 
        ? this.property.images.length - 1 
        : this.activeImageIndex - 1;
      this.setActiveImage(newIndex);
    }
  }

  submitContactForm(): void {
    this.formSubmitted = true;
    this.checkAuthStatus();
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
    this.scheduleSubmitted = true;
    this.checkAuthStatus();
    if (this.scheduleForm.valid && this.property && this.userId) {
      // Map data từ form sang đúng định dạng API yêu cầu
      const formData = {
        propertyId: this.property.id,
        agentId: this.property.agent.id,
        buyerId: this.userId,
        appointmentDate: this.scheduleForm.get('date')?.value,
        appointmentTime: this.scheduleForm.get('time')?.value,
        notes: this.scheduleForm.get('notes')?.value
      };

      console.log('Sending appointment data:', formData);

      this.appointmentService.createAppointment(formData).subscribe({
        next: (response) => {
          console.log('Appointment created successfully:', response);
          this.toastr.success('Viewing scheduled successfully!');
          this.showScheduleForm = false;
          this.scheduleForm.reset();
          this.scheduleSubmitted = false;
        },
        error: (error) => {
          console.error('Error scheduling viewing:', error);
          this.toastr.error('Failed to schedule viewing. Please try again.');
          this.scheduleSubmitted = false;
        }
      });
    } else {
      this.toastr.warning('Please fill in all required fields');
      this.scheduleSubmitted = false;
    }
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
    if (!this.isAuthenticated) {
      this.toastr.info('Please log in to schedule a viewing');
      this.router.navigate(['/login'], { 
        queryParams: { redirect: `/property/${this.propertyId}` } 
      });
      return;
    }
    
    this.showScheduleForm = !this.showScheduleForm;
    
    // If opening schedule form, close contact form
    if (this.showScheduleForm) {
      this.showContactForm = false;
      setTimeout(() => {
        const element = document.querySelector('.schedule-viewing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  // Toggle offer form visibility
  toggleOfferForm(): void {
    if (!this.isAuthenticated) {
      this.toastr.info('Please log in to submit an offer');
      this.router.navigate(['/login'], { 
        queryParams: { redirect: `/property/${this.propertyId}` } 
      });
      return;
    }
    
    if (this.isAgent) {
      this.toastr.info('As an agent, you cannot submit offers on properties');
      return;
    }
    
    this.showOfferForm = !this.showOfferForm;
    
    // Reset form when opening
    if (this.showOfferForm && this.property) {
      // Set today as the default startDate value
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      
      // Set default endDate as 1 year from today
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const formattedNextYear = nextYear.toISOString().split('T')[0];
      
      this.offerForm.patchValue({
        offerPrice: this.property.price,
        message: '',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startDate: formattedToday,
        endDate: formattedNextYear
      });
      
      // Set validators based on property type (for rent/lease properties)
      if (this.property.type === 'rent') {
        this.offerForm.get('startDate')?.setValidators([Validators.required]);
        this.offerForm.get('endDate')?.setValidators([Validators.required]);
      } else {
        this.offerForm.get('startDate')?.clearValidators();
        this.offerForm.get('endDate')?.clearValidators();
      }
      
      this.offerForm.get('startDate')?.updateValueAndValidity();
      this.offerForm.get('endDate')?.updateValueAndValidity();
    }
  }
  
  // Submit offer
  submitOffer(): void {
    if (!this.isAuthenticated || !this.userId || !this.propertyId || !this.property) {
      this.toastr.error('You must be logged in to submit an offer');
      return;
    }
    
    this.offerForm.markAllAsTouched();
    if (this.offerForm.invalid) {
      return;
    }
    
    this.offerSubmitted = true;
    
    const offerRequest: OfferRequest = {
      listingId: this.propertyId,
      userId: this.userId,
      agentId: this.property.agent?.id?.toString() || '',
      offerPrice: this.offerForm.value.offerPrice,
      expiresAt: new Date(this.offerForm.value.expiresAt).toISOString(),
      message: this.offerForm.value.message || undefined
    };
    
    // Add rental period if property is for rent
    if (this.property.type === 'rent') {
      offerRequest.startRentAt = this.offerForm.value.startDate;
      offerRequest.endRentAt = this.offerForm.value.endDate;
    }
    
    console.log('Submitting offer with agentId:', offerRequest.agentId);
    
    this.offerService.createOffer(offerRequest).subscribe({
      next: (response) => {
        this.toastr.success('Your offer has been submitted successfully');
        this.showOfferForm = false;
        this.offerSubmitted = false;
        this.offerForm.reset();
      },
      error: (error) => {
        console.error('Error submitting offer:', error);
        this.toastr.error('There was an error submitting your offer. Please try again.');
        this.offerSubmitted = false;
      }
    });
  }
} 