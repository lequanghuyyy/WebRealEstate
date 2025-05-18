import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewResponse, ReviewRequest } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrWrapperService } from '../../services/toastr-wrapper.service';
import { UserService } from '../../services/user.service';
import { UserResponse } from '../../models/auth.model';

@Component({
  selector: 'app-property-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './property-reviews.component.html',
  styleUrls: ['./property-reviews.component.scss']
})
export class PropertyReviewsComponent implements OnInit {
  @Input() propertyId: string = '';
  
  reviews: ReviewResponse[] = [];
  isLoading: boolean = true;
  showAddReview: boolean = false;
  reviewForm: FormGroup;
  currentRoute: string = '';
  
  hasReviewed: boolean = false;
  submitSuccessful: boolean = false;
  errorMessage: string = '';
  averageRating: number = 0;
  
  // Map to store user data for reviewers
  userDataMap: Map<string, UserResponse> = new Map();

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrWrapperService,
    private userService: UserService
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      comment: ['', [Validators.required, Validators.minLength(20)]]
    });
    
    this.currentRoute = this.router.url;
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnChanges(): void {
    if (this.propertyId) {
      this.loadReviews();
    }
  }

  loadReviews(): void {
    if (!this.propertyId) {
      console.warn('No property ID provided');
      this.isLoading = false;
      return;
    }
    
    console.log('Loading reviews for property ID:', this.propertyId);
    this.isLoading = true;
    
    this.reviewService.getReviewsByListingId(this.propertyId).subscribe({
      next: (reviews) => {
        console.log('Received reviews:', reviews);
        this.reviews = reviews || [];
        this.isLoading = false;
        
        this.averageRating = this.reviewService.calculateAverageRating(this.reviews);
        
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.hasReviewed = this.reviews.some(r => r.brId === currentUser.id);
        }
        
        // Load reviewer data for each review
        this.loadReviewerData();
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
        this.errorMessage = 'Could not load reviews. Please try again later.';
      }
    });
  }

  // Load reviewer data for all reviews
  loadReviewerData(): void {
    // Get unique reviewer IDs
    const reviewerIds = [...new Set(this.reviews.map(review => review.brId))];
    
    // Load user data for each reviewer
    reviewerIds.forEach(reviewerId => {
      this.userService.getUserById(reviewerId).subscribe({
        next: (userData) => {
          console.log(`Got user data for reviewer ${reviewerId}:`, userData);
          this.userDataMap.set(reviewerId, userData);
        },
        error: (error) => {
          console.error(`Error fetching data for reviewer ${reviewerId}:`, error);
        }
      });
    });
  }

  // Get reviewer avatar URL
  getReviewerAvatar(reviewerId: string): string {
    const userData = this.userDataMap.get(reviewerId);
    
    if (userData) {
      if (userData.avatarImg) {
        return userData.avatarImg;
      } else if (userData.photo) {
        return userData.photo;
      }
    }
    
    // Return default if no user data or no avatar
    return 'assets/images/default-avatar.jpg';
  }

  // Method to get the average rating for the template
  getAverageRating(): number {
    return this.averageRating;
  }

  // Method to get the rounded average for star display
  getRoundedAverage(): number {
    return Math.round(this.averageRating);
  }

  toggleAddReview(): void {
    this.showAddReview = !this.showAddReview;
    
    if (!this.showAddReview) {
      this.reviewForm.reset({
        rating: 5
      });
    }
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.toastr.error('You must be logged in to write a review');
      return;
    }

    // Get form values and ensure they're not null/undefined
    const title = this.reviewForm.get('title')?.value || '';
    const comment = this.reviewForm.get('comment')?.value || '';
    const rating = this.reviewForm.get('rating')?.value || 5;

    // Check if required fields are not empty after trimming
    if (!title.trim()) {
      this.toastr.error('Review title cannot be empty');
      return;
    }

    if (!comment.trim()) {
      this.toastr.error('Review content cannot be empty');
      return;
    }

    const newReview: ReviewRequest = {
      listingId: this.propertyId,
      brId: currentUser.id,
      title: title.trim(),
      contentReview: comment.trim(),
      rate: rating
    };

    console.log('Submitting review:', newReview);
    
    this.reviewService.createReview(newReview).subscribe({
      next: (response) => {
        console.log('Review created successfully:', response);
        this.toastr.success('Your review has been posted!');
        
        this.reviews.unshift(response);
        
        this.averageRating = this.reviewService.calculateAverageRating(this.reviews);
        
        this.reviewForm.reset({ rating: 5 });
        this.showAddReview = false;
        this.hasReviewed = true;
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.toastr.error('There was an error submitting your review. Please try again.');
        this.errorMessage = 'There was an error submitting your review. Please try again.';
      }
    });
  }

  likeReview(reviewId: string): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please log in to like reviews');
      return;
    }
    
    this.reviewService.likeReview(reviewId).subscribe({
      next: (updatedReview) => {
        console.log('Review liked successfully:', updatedReview);
        
        const index = this.reviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }
        
        this.toastr.success('Thanks for your feedback!');
      },
      error: (error) => {
        console.error('Error liking review:', error);
        this.toastr.error('Could not like this review. Please try again later.');
      }
    });
  }

  // Method to handle marking a review as helpful
  markHelpful(reviewId: string): void {
    if (!this.authService.isLoggedIn()) {
      this.toastr.info('Please log in to mark reviews as helpful');
      return;
    }
    
    // Call the service method
    this.reviewService.likeReview(reviewId).subscribe({
      next: (updatedReview) => {
        console.log('Review marked as helpful:', updatedReview);
        
        // Update the review in the list
        const index = this.reviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }
        
        this.toastr.success('Thanks for your feedback!');
      },
      error: (error) => {
        console.error('Error marking review as helpful:', error);
        this.toastr.error('Could not mark this review as helpful. Please try again later.');
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    
    const count = this.reviews.filter(r => r.rate === rating).length;
    return Math.round((count / this.reviews.length) * 100);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  
  getUserName(brId: string): string {
    const user = this.authService.getCurrentUser();
    if (user && user.id === brId) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      } else if (user.name) {
        return user.name;
      } else if (user.email) {
        return user.email.split('@')[0];
      }
    }
    
    return 'User';
  }
} 