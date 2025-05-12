import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ReviewRequest, ReviewResponse, BaseResponse, Page } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/ux/reviews`;
  
  constructor(private http: HttpClient) { }
  
  // Get all reviews for a specific user
  getUserReviews(userId: string): Observable<ReviewResponse[]> {
    return this.http.get<BaseResponse<ReviewResponse[]>>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching user reviews:', error);
          // Return mock data for development
          return of(this.getMockReviews());
        })
      );
  }

  // Get all reviews for a specific property
  getPropertyReviews(propertyId: string): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.apiUrl}/property/${propertyId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching property reviews:', error);
          return of([]);
        })
      );
  }

  // Create a new review
  createReview(reviewData: ReviewRequest): Observable<ReviewResponse> {
    console.log('Creating review:', reviewData);
    return this.http.post<BaseResponse<ReviewResponse>>(this.apiUrl, reviewData).pipe(
      map(response => {
        console.log('Create review response:', response);
        return response.data;
      }),
      catchError(error => {
        console.error('Error creating review:', error);
        throw error;
      })
    );
  }

  // Update an existing review
  updateReview(id: string, reviewData: ReviewRequest): Observable<ReviewResponse> {
    return this.http.put<BaseResponse<ReviewResponse>>(`${this.apiUrl}/${id}`, reviewData).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating review:', error);
        throw error;
      })
    );
  }

  // Delete a review
  deleteReview(id: string): Observable<void> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined as void),
      catchError(error => {
        console.error('Error deleting review:', error);
        throw error;
      })
    );
  }

  // Get a review by ID
  getReviewById(id: string): Observable<ReviewResponse> {
    return this.http.get<BaseResponse<ReviewResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching review by ID:', error);
        throw error;
      })
    );
  }

  // Get reviews by buyer/renter ID
  getReviewsByBrId(brId: string, page: number = 0): Observable<Page<ReviewResponse>> {
    return this.http.get<any>(`${this.apiUrl}/br/${brId}?page=${page}`).pipe(
      map(response => {
        console.log('Raw response from API:', response);
        
        // Trường hợp API trả về đúng định dạng Page
        if (response && response.data && response.data.content) {
          return response.data as Page<ReviewResponse>;
        }
        
        // Trường hợp API trả về dạng mảng thay vì Page
        if (Array.isArray(response) || (response && Array.isArray(response.data))) {
          const reviews = Array.isArray(response) ? response : response.data;
          console.log('Converting array to Page object:', reviews);
          
          // Tạo Page object giả lập từ array
          return {
            content: reviews.map((review: any) => ({
              ...review,
              title: review.title || ''  // Đảm bảo title không null
            })),
            pageable: { pageNumber: page, pageSize: reviews.length },
            totalElements: reviews.length,
            totalPages: 1,
            last: true,
            first: true,
            size: reviews.length,
            number: page,
            numberOfElements: reviews.length,
            empty: reviews.length === 0
          };
        }
        
        // Fallback nếu không có dữ liệu
        return {
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
      }),
      catchError(error => {
        console.error('Error fetching reviews by BR ID:', error);
        return of({
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
        });
      })
    );
  }

  // Get reviews by listing ID
  getReviewsByListingId(listingId: string): Observable<ReviewResponse[]> {
    console.log('Fetching reviews for listing ID:', listingId);
    return this.http.get<BaseResponse<ReviewResponse[]>>(`${this.apiUrl}/listing/${listingId}`).pipe(
      map(response => {
        console.log('Listing reviews response:', response);
        return response.data;
      }),
      catchError(error => {
        console.error('Error fetching reviews by listing ID:', error);
        return of([]);
      })
    );
  }

  // Like a review
  likeReview(id: string): Observable<ReviewResponse> {
    return this.http.post<BaseResponse<ReviewResponse>>(`${this.apiUrl}/${id}/like`, {}).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error liking review:', error);
        throw error;
      })
    );
  }
  
  // Mock reviews for development/testing
  private getMockReviews(): ReviewResponse[] {
    return [
      {
        id: '1',
        listingId: '101',
        brId: 'user-123',
        title: 'Modern Apartment in Downtown',
        contentReview: 'Great location and amenities. Very clean and modern.',
        rate: 4,
        countLike: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        listingId: '102',
        brId: 'user-123',
        title: 'Seaside Villa with Pool',
        contentReview: 'Amazing property with breathtaking views. Perfect for a family vacation.',
        rate: 5,
        countLike: 12,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        listingId: '103',
        brId: 'user-123',
        title: 'Cozy Studio near University',
        contentReview: 'Decent place for the price. Could use some maintenance on the bathroom fixtures.',
        rate: 3,
        countLike: 2,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Legacy methods converted to use ReviewResponse
  getReviewsByPropertyId(propertyId: string): Observable<ReviewResponse[]> {
    return this.getReviewsByListingId(propertyId);
  }

  getReviewsByUserId(userId: string, page: number = 0): Observable<Page<ReviewResponse>> {
    return this.getReviewsByBrId(userId, page);
  }

  addReview(review: Omit<ReviewRequest, 'brId'>): Observable<ReviewResponse> {
    // Simply redirect to the new API method
    const newReviewRequest: ReviewRequest = {
      ...review,
      brId: review.listingId, // This is a placeholder, should be replaced with actual user ID
      rate: review.rate || 5
    };
    
    return this.createReview(newReviewRequest);
  }

  markHelpful(id: string): Observable<ReviewResponse> {
    return this.likeReview(id);
  }

  // Helper method to calculate average rating
  calculateAverageRating(reviews: ReviewResponse[]): number {
    if (!reviews || reviews.length === 0) {
      return 0;
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rate, 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  }
} 