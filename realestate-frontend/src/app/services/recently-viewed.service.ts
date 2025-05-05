import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RecentlyViewedRequest, RecentlyViewedResponse, BaseResponse } from '../models/user-experience.model';

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {
  private apiUrl = `${environment.userExperienceServiceUrl}/recently-viewed`;

  constructor(private http: HttpClient) { }

  // Record a property view
  recordView(userId: string, listingId: string): Observable<void> {
    const request: RecentlyViewedRequest = { userId, listingId };
    return this.http.post<void>(this.apiUrl, request);
  }

  // Get recently viewed properties for a user
  getRecentlyViewed(userId: string, limit: number = 10): Observable<RecentlyViewedResponse[]> {
    return this.http.get<RecentlyViewedResponse[]>(`${this.apiUrl}/${userId}?limit=${limit}`);
  }
} 