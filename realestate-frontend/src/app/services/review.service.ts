import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
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

  constructor() { }

  getReviewsByPropertyId(propertyId: string): Observable<Review[]> {
    const reviews = this.mockReviews.filter(review => review.propertyId === propertyId);
    return of(reviews);
  }

  getReviewsByUserId(userId: string): Observable<Review[]> {
    const reviews = this.mockReviews.filter(review => review.userId === userId);
    return of(reviews);
  }

  addReview(review: Omit<Review, 'id' | 'date' | 'helpful'>): Observable<Review> {
    const newReview: Review = {
      ...review,
      id: (this.mockReviews.length + 1).toString(),
      date: new Date(),
      helpful: 0
    };
    
    this.mockReviews.push(newReview);
    return of(newReview);
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    const index = this.mockReviews.findIndex(r => r.id === id);
    if (index !== -1) {
      this.mockReviews[index] = { ...this.mockReviews[index], ...review };
      return of(this.mockReviews[index]);
    }
    return of({} as Review);
  }

  deleteReview(id: string): Observable<boolean> {
    const index = this.mockReviews.findIndex(r => r.id === id);
    if (index !== -1) {
      this.mockReviews.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  markHelpful(id: string): Observable<Review> {
    const index = this.mockReviews.findIndex(r => r.id === id);
    if (index !== -1) {
      this.mockReviews[index].helpful += 1;
      return of(this.mockReviews[index]);
    }
    return of({} as Review);
  }
} 