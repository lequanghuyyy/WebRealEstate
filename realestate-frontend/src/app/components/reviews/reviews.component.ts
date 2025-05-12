import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { ReviewResponse, ReviewRequest, Page } from '../../models/review.model';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  reviewsPage: Page<ReviewResponse> = {
    content: [],
    pageable: { pageNumber: 0, pageSize: 10 },
    totalElements: 0,
    totalPages: 0,
    last: true,
    first: true,
    size: 0,
    number: 0,
    numberOfElements: 0,
    empty: true
  };
  reviews: ReviewResponse[] = [];
  currentPage: number = 0;
  isLoading: boolean = true;
  showConfirmDelete: boolean = false;
  deleteReviewId: string | null = null;
  currentUserId: string = 'user1'; // Giả lập ID người dùng hiện tại
  
  editMode: boolean = false;
  reviewForm: FormGroup;
  editingReviewId: string | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  listingId: string = ''; // Changed from propertyId to listingId

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
    if (this.authService.isLoggedIn()) {
      this.loadUserReviews(0);
    } else {
      this.isLoading = false;
      this.errorMessage = 'You must be logged in to view your reviews';
    }
  }

  loadUserReviews(page: number = 0): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.isLoading = false;
      this.errorMessage = 'You must be logged in to view your reviews';
      return;
    }

    console.log('Loading reviews for user ID:', currentUser.id);
    
    this.reviewService.getReviewsByUserId(currentUser.id, page).subscribe({
      next: (pageData) => {
        console.log('Received page data:', pageData);
        this.reviewsPage = pageData;
        
        // Đảm bảo mỗi review có đầy đủ thông tin và không có trường null
        if (pageData.content && Array.isArray(pageData.content)) {
          this.reviews = pageData.content.map((review: ReviewResponse) => ({
            ...review,
            title: review.title || 'Untitled Review',
            contentReview: review.contentReview || '',
            rate: review.rate || 5,
            countLike: review.countLike || 0,
            createdAt: review.createdAt || new Date().toISOString()
          }));
        } else {
          this.reviews = [];
        }
        
        console.log('Processed reviews:', this.reviews);
        this.currentPage = pageData.number;
        this.isLoading = false;
        
        if (this.reviews.length === 0) {
          this.successMessage = 'You have not written any reviews yet.';
        }
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load reviews. Please try again.';
        this.reviews = [];
      }
    });
  }

  fetchReviews(): void {
    this.loadUserReviews(this.currentPage);
  }

  nextPage(): void {
    if (this.reviewsPage && !this.reviewsPage.last) {
      this.loadUserReviews(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.reviewsPage && !this.reviewsPage.first) {
      this.loadUserReviews(this.currentPage - 1);
    }
  }

  goToPage(page: number): void {
    if (this.reviewsPage && page >= 0 && page < this.reviewsPage.totalPages) {
      this.loadUserReviews(page);
    }
  }

  getPaginationRange(): number[] {
    if (!this.reviewsPage) return [];
    
    const totalPages = this.reviewsPage.totalPages;
    const currentPage = this.currentPage;
    const range = 2; // Show 2 pages before and after current page
    
    if (totalPages <= 1) return [];
    
    let start = Math.max(0, currentPage - range);
    let end = Math.min(totalPages - 1, currentPage + range);
    
    // Adjust if range is not fulfilled
    if (currentPage - start < range) {
      end = Math.min(totalPages - 1, end + (range - (currentPage - start)));
    }
    if (end - currentPage < range) {
      start = Math.max(0, start - (range - (end - currentPage)));
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  confirmDelete(reviewId: string): void {
    this.deleteReviewId = reviewId;
    this.showConfirmDelete = true;
  }

  cancelDelete(): void {
    this.showConfirmDelete = false;
    this.deleteReviewId = null;
  }

  deleteReview(id?: string): void {
    const reviewId = id || this.deleteReviewId;
    if (!reviewId) return;
    
    this.reviewService.deleteReview(reviewId).subscribe({
      next: () => {
        // Successfully deleted, reload current page to get updated data
        this.loadUserReviews(this.currentPage);
        this.showConfirmDelete = false;
        this.deleteReviewId = null;
        this.successMessage = 'Review deleted successfully.';
      },
      error: (error) => {
        console.error('Error deleting review:', error);
        this.errorMessage = 'Failed to delete review. Please try again.';
      }
    });
  }

  saveReview(): void {
    if (this.editingReviewId) {
      this.updateReview();
    }
  }

  editReview(review: ReviewResponse): void {
    this.editMode = true;
    this.editingReviewId = review.id;
    this.listingId = review.listingId;
    this.reviewForm.patchValue({
      title: review.title || '',
      comment: review.contentReview || '',
      rating: review.rate || 5
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

    // Get form values and ensure they're not null/undefined
    const title = formValue.title || '';
    const comment = formValue.comment || '';
    const rating = formValue.rating || 5;

    // Check if required fields are not empty after trimming
    if (!title.trim()) {
      this.errorMessage = 'Review title cannot be empty';
      return;
    }

    if (!comment.trim()) {
      this.errorMessage = 'Review content cannot be empty';
      return;
    }

    // Create updated review request
    const updatedReview: ReviewRequest = {
      listingId: this.listingId,
      brId: currentUser.id,
      title: title.trim(),
      contentReview: comment.trim(),
      rate: rating
    };

    this.reviewService.updateReview(this.editingReviewId, updatedReview).subscribe({
      next: (review) => {
        // Reload the current page to refresh the data
        this.loadUserReviews(this.currentPage);
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
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  }
} 