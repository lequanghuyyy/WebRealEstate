import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../models/listing.model';
import { RecommendationResponse } from '../models/recommendation.model';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = '/api/ux/recommendations';

  constructor(private http: HttpClient) { }

  // Get property recommendations for a user
  getRecommendations(userId: string, limit: number = 3): Observable<RecommendationResponse> {
    if (!userId) {
      return throwError(() => new Error('User ID is required for recommendations'));
    }
    
    const url = `${this.apiUrl}/${userId}?limit=${limit}`;
    
    return this.http.get<BaseResponse<RecommendationResponse>>(url)
      .pipe(
        map(response => {
          console.log('Recommendation API response:', response);
          return response.data;
        }),
        catchError(error => {
            console.error(`Error fetching recommendations for user ${userId}:`, error);
          return throwError(() => error);
        })
      );
  }
} 