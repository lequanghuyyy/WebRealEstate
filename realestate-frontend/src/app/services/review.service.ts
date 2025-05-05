import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Review } from '../models/review.model';
import { ReviewRequest, ReviewResponse, BaseResponse } from '../models/user-experience.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.userExperienceServiceUrl}/reviews`;
  
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
    return this.http.post<BaseResponse<ReviewResponse>>(this.apiUrl, reviewData).pipe(
      map(response => response.data)
    );
  }

  // Update an existing review
  updateReview(id: string, reviewData: ReviewRequest): Observable<ReviewResponse> {
    return this.http.put<BaseResponse<ReviewResponse>>(`${this.apiUrl}/${id}`, reviewData).pipe(
      map(response => response.data)
    );
  }

  // Delete a review
  deleteReview(id: string): Observable<void> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined as void)
    );
  }

  // Get a review by ID
  getReviewById(id: string): Observable<ReviewResponse> {
    return this.http.get<BaseResponse<ReviewResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // Get reviews by buyer/renter ID
  getReviewsByBrId(brId: string): Observable<ReviewResponse[]> {
    return this.http.get<BaseResponse<ReviewResponse[]>>(`${this.apiUrl}/br/${brId}`).pipe(
      map(response => response.data)
    );
  }

  // Get reviews by listing ID
  getReviewsByListingId(listingId: string): Observable<ReviewResponse[]> {
    return this.http.get<BaseResponse<ReviewResponse[]>>(`${this.apiUrl}/listing/${listingId}`).pipe(
      map(response => response.data)
    );
  }

  // Like a review
  likeReview(id: string): Observable<ReviewResponse> {
    return this.http.post<BaseResponse<ReviewResponse>>(`${this.apiUrl}/${id}/like`, {}).pipe(
      map(response => response.data)
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        listingId: '102',
        brId: 'user-123',
        title: 'Seaside Villa with Pool',
        contentReview: 'Amazing property with breathtaking views. Perfect for a family vacation.',
        rate: 5,
        countLike: 12,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        listingId: '103',
        brId: 'user-123',
        title: 'Cozy Studio near University',
        contentReview: 'Decent place for the price. Could use some maintenance on the bathroom fixtures.',
        rate: 3,
        countLike: 2,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Legacy methods using mock data
  private mockReviews: Review[] = [
    {
      id: '1',
      propertyId: '1',
      userId: 'user1',
      rating: 5,
      title: 'Tuyệt vời! Ngôi nhà mơ ước',
      comment: 'Tôi đã xem ngôi nhà này và nó vượt quá mong đợi. Thiết kế hiện đại, không gian rộng rãi và rất sáng sủa. Vị trí cũng rất thuận tiện.',
      date: new Date('2023-05-15'),
      userName: 'Hoàng Minh',
      userAvatar: 'https://placehold.co/200x200/2c3e50/ffffff?text=HM',
      helpful: 12
    },
    {
      id: '2',
      propertyId: '1',
      userId: 'user2',
      rating: 4,
      title: 'Rất tốt nhưng còn vài điểm cần cải thiện',
      comment: 'Ngôi nhà rất đẹp và thiết kế hợp lý. Tuy nhiên, hệ thống điều hòa hơi ồn và cần được bảo trì tốt hơn.',
      date: new Date('2023-06-20'),
      userName: 'Nguyễn Thảo',
      userAvatar: 'https://placehold.co/200x200/e74c3c/ffffff?text=NT',
      helpful: 5
    },
    {
      id: '3',
      propertyId: '2',
      userId: 'user3',
      rating: 5,
      title: 'Căn hộ sang trọng đáng giá',
      comment: 'Penthouse này thực sự tuyệt vời! Tầm nhìn ra thành phố ngoạn mục và các tiện nghi cao cấp. Đáng đồng tiền bát gạo.',
      date: new Date('2023-07-10'),
      userName: 'Trần Đức',
      userAvatar: 'https://placehold.co/200x200/3498db/ffffff?text=TD',
      helpful: 8
    },
    {
      id: '4',
      propertyId: '3',
      userId: 'user1',
      rating: 3,
      title: 'Tiềm năng nhưng cần cải tạo',
      comment: 'Cottage này có vị trí tốt và không gian ấm cúng, nhưng cần được sửa chữa và nâng cấp một số khu vực.',
      date: new Date('2023-08-05'),
      userName: 'Hoàng Minh',
      userAvatar: 'https://placehold.co/200x200/2c3e50/ffffff?text=HM',
      helpful: 3
    }
  ];

  getReviewsByPropertyId(propertyId: string): Observable<Review[]> {
    const propertyReviews = this.mockReviews.filter(
      review => review.propertyId === propertyId
    );
    return of(propertyReviews);
  }

  getReviewsByUserId(userId: string): Observable<Review[]> {
    const reviews = this.mockReviews.filter(review => review.userId === userId);
    return of(reviews);
  }

  addReview(review: Omit<Review, 'id' | 'date' | 'helpful'>): Observable<Review> {
    const newReview: Review = {
      ...review,
      id: `rev-${this.mockReviews.length + 1}`,
      date: new Date(),
      helpful: 0
    };
    this.mockReviews.push(newReview);
    return of(newReview);
  }

  markHelpful(id: string): Observable<Review> {
    const review = this.mockReviews.find(r => r.id === id);
    if (review) {
      review.helpful = (review.helpful || 0) + 1;
      return of(review);
    }
    return of({} as Review);
  }
} 