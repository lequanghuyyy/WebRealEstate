import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Review } from '../../models/review.model';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  isLoading: boolean = true;
  showConfirmDelete: boolean = false;
  deleteReviewId: string | null = null;
  currentUserId: string = 'user1'; // Giả lập ID người dùng hiện tại
  
  editMode: boolean = false;
  reviewForm: FormGroup;
  editingReviewId: string | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  propertyId: string = ''; // Add missing property

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      comment: ['', [Validators.required, Validators.minLength(20)]],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit(): void {
    this.loadUserReviews();
  }

  loadUserReviews(): void {
    // Trong ứng dụng thực, lấy userId từ AuthService
    // const userId = this.authService.getCurrentUser().id;
    const userId = this.currentUserId; // Mã giả
    
    this.reviewService.getReviewsByUserId(userId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });
  }

  // Add this method to match the template
  fetchReviews(): void {
    this.loadUserReviews();
  }

  confirmDelete(reviewId: string): void {
    this.deleteReviewId = reviewId;
    this.showConfirmDelete = true;
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
    this.deleteReviewId = null;
  }

  // Fix to accept ID parameter
  deleteReview(id?: string): void {
    const reviewId = id || this.deleteReviewId;
    if (!reviewId) return;
    
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        // Successfully deleted
        this.reviews = this.reviews.filter(review => review.id !== reviewId);
        this.showConfirmDelete = false;
        this.deleteReviewId = null;
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.errorMessage = 'Failed to delete review. Please try again.';
      }
    });
  }

  // Add this method to match the template
  saveReview(): void {
    if (this.editingReviewId) {
      this.updateReview();
    }
  }

  editReview(review: Review): void {
    this.editMode = true;
    this.editingReviewId = review.id;
    this.propertyId = review.propertyId; // Set the property ID
    this.reviewForm.patchValue({
      title: review.title,
      comment: review.comment,
      rating: review.rating
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editingReviewId = null;
    this.reviewForm.reset({
      rating: 5
    });
  }

  updateReview(): void {
    if (this.reviewForm.invalid || !this.editingReviewId) {
      return;
    }

    const formValue = this.reviewForm.value;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You need to be logged in to update a review.';
      return;
    }

    // Create updated review request
    const updatedReview = {
      listingId: this.propertyId,
      brId: currentUser.id,
      title: formValue.title,
      contentReview: formValue.comment,
      rate: formValue.rating
    };

    this.reviewService.updateReview(this.editingReviewId, updatedReview).subscribe({
      next: (review) => {
        // Convert to local review format
        const updatedLocalReview = {
          id: review.id,
          propertyId: review.listingId,
          userId: review.brId,
          title: review.title || '',
          comment: review.contentReview || '',
          rating: review.rate,
          date: new Date(review.createdAt),
          userName: currentUser.name || 'Anonymous',
          userAvatar: '/assets/images/avatar-placeholder.jpg',
          helpful: review.countLike || 0
        };
        
        // Update in the local array
        const index = this.reviews.findIndex(r => r.id === this.editingReviewId);
        if (index !== -1) {
          this.reviews[index] = updatedLocalReview;
        }
        
        this.cancelEdit();
        this.successMessage = 'Review updated successfully.';
      },
      error: (error) => {
        console.error('Error updating review:', error);
        this.errorMessage = 'Failed to update review. Please try again.';
      }
    });
  }

  // Tiện ích để hiển thị sao đánh giá
  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  // Format ngày tháng
  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  }
} 