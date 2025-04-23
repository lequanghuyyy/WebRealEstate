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

  confirmDelete(reviewId: string): void {
    this.deleteReviewId = reviewId;
    this.showConfirmDelete = true;
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
    this.deleteReviewId = null;
  }

  deleteReview(): void {
    if (!this.deleteReviewId) return;
    
    this.reviewService.deleteReview(this.deleteReviewId).subscribe({
      next: (success) => {
        if (success) {
          this.reviews = this.reviews.filter(r => r.id !== this.deleteReviewId);
          this.showConfirmDelete = false;
          this.deleteReviewId = null;
        }
      },
      error: (error) => {
        console.error('Error deleting review:', error);
      }
    });
  }

  editReview(review: Review): void {
    this.editMode = true;
    this.editingReviewId = review.id;
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

  saveReview(): void {
    if (this.reviewForm.invalid) {
      // Đánh dấu các trường không hợp lệ
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.editMode && this.editingReviewId) {
      const updatedReview = {
        title: this.reviewForm.value.title,
        comment: this.reviewForm.value.comment,
        rating: this.reviewForm.value.rating
      };

      this.reviewService.updateReview(this.editingReviewId, updatedReview).subscribe({
        next: (review) => {
          const index = this.reviews.findIndex(r => r.id === this.editingReviewId);
          if (index !== -1) {
            this.reviews[index] = review;
          }
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Error updating review:', error);
        }
      });
    }
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