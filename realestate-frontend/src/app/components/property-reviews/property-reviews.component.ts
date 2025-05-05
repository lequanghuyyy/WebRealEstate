import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Review } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-property-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './property-reviews.component.html',
  styleUrls: ['./property-reviews.component.scss']
})
export class PropertyReviewsComponent implements OnInit {
  @Input() propertyId: string = '';
  
  reviews: Review[] = [];
  isLoading: boolean = true;
  showAddReview: boolean = false;
  reviewForm: FormGroup;
  currentRoute: string = ''; // Đường dẫn hiện tại
  
  // Simulated current user
  currentUser = {
    id: 'user1',
    name: 'Hoang Minh',
    avatar: 'https://placehold.co/200x200/2c3e50/ffffff?text=HM'
  };
  
  hasReviewed: boolean = false;
  submitSuccessful: boolean = false;
  errorMessage: string = '';

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      comment: ['', [Validators.required, Validators.minLength(20)]]
    });
    
    // Lưu đường dẫn hiện tại để chuyển hướng sau khi đăng nhập
    this.currentRoute = this.router.url;
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    if (!this.propertyId) return;
    
    this.reviewService.getReviewsByPropertyId(this.propertyId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoading = false;
        
        // Check if current user has already reviewed
        this.hasReviewed = this.reviews.some(r => r.userId === this.currentUser.id);
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });
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
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    const currentUser = this.authService.getCurrentUser();

    // Create review request
    const newReview = {
      listingId: this.propertyId,
      brId: currentUser?.id || '',
      title: this.reviewForm.get('title')?.value,
      contentReview: this.reviewForm.get('comment')?.value,
      rate: this.reviewForm.get('rating')?.value
    };

    this.reviewService.createReview(newReview).subscribe({
      next: (response) => {
        // Convert to local review format
        const addedReview = {
          id: response.id,
          propertyId: response.listingId,
          userId: response.brId,
          rating: response.rate,
          title: response.title || '',
          comment: response.contentReview || '',
          date: new Date(response.createdAt),
          userName: currentUser?.firstName + ' ' + currentUser?.lastName || 'Anonymous',
          userAvatar: '/assets/images/avatar-placeholder.jpg',
          helpful: 0
        };
        
        this.reviews.unshift(addedReview);
        this.reviewForm.reset();
        this.submitSuccessful = true;
        this.hasReviewed = true;
        
        setTimeout(() => {
          this.submitSuccessful = false;
        }, 5000);
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        this.errorMessage = 'There was an error submitting your review. Please try again.';
      }
    });
  }

  markHelpful(reviewId: string): void {
    this.reviewService.markHelpful(reviewId).subscribe({
      next: (updatedReview) => {
        const index = this.reviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }
      },
      error: (error) => {
        console.error('Error marking review as helpful:', error);
      }
    });
  }

  // Utility to display rating stars
  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  // Calculate average rating
  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  // Round average rating
  getRoundedAverage(): number {
    return Math.round(this.getAverageRating());
  }

  // Get percentage for each rating
  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    
    const count = this.reviews.filter(r => r.rating === rating).length;
    return Math.round((count / this.reviews.length) * 100);
  }

  // Format date
  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US');
  }

  // Calculate average rating (add this missing method)
  calculateAverageRating(): number {
    return this.getAverageRating();
  }

  // Kiểm tra người dùng đã đăng nhập chưa
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
} 