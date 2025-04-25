import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PropertyReviewsComponent]
})
export class PropertyDetailsComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
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
      phone: ['', [Validators.pattern(/^\+?[0-9\s\-\(\)]{10,15}$/)]]
    });
  }

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (this.propertyId) {
      this.loadPropertyDetails(this.propertyId);
    } else {
      this.handleError('Property ID not found');
    }
  }

  loadPropertyDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.propertyService.getPropertyById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.isLoading = false;
        this.loadSimilarProperties(property);
      },
      error: (error: any) => {
        this.handleError('Failed to load property details');
        console.error('Error loading property:', error);
      }
    });
  }

  loadSimilarProperties(property: Property): void {
    // Fetch similar properties based on current property
    this.propertyService.getSimilarProperties(property.id, property.type, property.location.city).subscribe({
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
      this.activeImageIndex = (this.activeImageIndex - 1 + this.property.images.length) % this.property.images.length;
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
          alert('Your message has been sent successfully!');
        },
        error: (error: any) => {
          console.error('Error submitting contact form:', error);
          alert('Failed to send message. Please try again later.');
        }
      });
    }
  }

  submitScheduleForm(): void {
    this.scheduleSubmitted = true;
    
    if (this.scheduleForm.valid && this.property) {
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        alert('Please log in to schedule an appointment with the agent.');
        return;
      }
      
      const formData = {
        propertyId: this.property.id,
        propertyTitle: this.property.title,
        propertyImage: this.property.images[0],
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        agentId: this.property.agent.id,
        agentName: this.property.agent.name,
        appointmentDate: this.scheduleForm.value.date,
        appointmentTime: this.scheduleForm.value.time,
        notes: this.scheduleForm.value.notes || 'No notes provided',
        meetingType: 'in-person' as 'online' | 'in-person',
        meetingLocation: 'At the property location',
        status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed'
      };

      this.appointmentService.createAppointment(formData).subscribe({
        next: () => {
          // Handle success
          this.scheduleForm.reset();
          this.scheduleSubmitted = false;
          this.showScheduleForm = false;
          alert('Your appointment request has been submitted successfully! Please check the Agent Appointments section in your profile.');
        },
        error: (error: any) => {
          console.error('Error scheduling viewing:', error);
          alert('Unable to schedule the appointment. Please try again later.');
        }
      });
    }
  }

  retryLoading(): void {
    if (this.propertyId) {
      this.loadPropertyDetails(this.propertyId);
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

  // Get appropriate icon for each amenity
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

  // Helper method for form validation in template
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