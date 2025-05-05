import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SavedSearchRequest, SavedSearchResponse, BaseResponse } from '../models/user-experience.model';

@Injectable({
  providedIn: 'root'
})
export class SavedSearchService {
  private apiUrl = `/api/ux/saved-searches`;

  constructor(private http: HttpClient) { }

  // Save a search
  saveSearch(searchData: SavedSearchRequest): Observable<SavedSearchResponse> {
    console.log('Sending saved search to:', this.apiUrl);
    return this.http.post<BaseResponse<SavedSearchResponse>>(this.apiUrl, searchData).pipe(
      map(response => response.data)
    );
  }

  // Get saved searches for a user
  getSavedSearches(userId: string): Observable<SavedSearchResponse[]> {
    return this.http.get<BaseResponse<SavedSearchResponse[]>>(`${this.apiUrl}/${userId}`).pipe(
      map(response => response.data)
    );
  }

  // Delete a saved search
  deleteSavedSearch(id: string): Observable<void> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined as void)
    );
  }
} 