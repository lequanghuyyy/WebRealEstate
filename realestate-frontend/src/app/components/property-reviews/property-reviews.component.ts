import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Review } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-property-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './property-reviews.component.html',
  styleUrls: ['./property-reviews.component.scss']
})
export class PropertyReviewsComponent implements OnInit {
  @Input() propertyId: string = '';
  
  reviews: Review[] = [];
  isLoading: boolean = true;
  showAddReview: boolean = false;
  reviewForm: FormGroup;
  
  // Simulated current user
  currentUser = {
    id: 'user1',
    name: 'Hoang Minh',
    avatar: 'https://placehold.co/200x200/2c3e50/ffffff?text=HM'
  };
  
  hasReviewed: boolean = false;

  constructor(
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      comment: ['', [Validators.required, Validators.minLength(20)]]
    });
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
      // Mark invalid fields
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    const newReview = {
      propertyId: this.propertyId,
      userId: this.currentUser.id,
      rating: this.reviewForm.value.rating,
      title: this.reviewForm.value.title,
      comment: this.reviewForm.value.comment,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar
    };
    
    this.reviewService.addReview(newReview).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.hasReviewed = true;
        this.showAddReview = false;
        this.reviewForm.reset({
          rating: 5
        });
      },
      error: (error) => {
        console.error('Error adding review:', error);
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
} 