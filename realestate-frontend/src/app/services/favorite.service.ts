import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FavoriteRequest {
  userId: string;
  listingId: string;
}

export interface FavoriteResponse {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface BaseResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/ux/favorites`;

  constructor(private http: HttpClient) { }

  addFavorite(userId: string, listingId: string): Observable<BaseResponse<FavoriteResponse>> {
    const request: FavoriteRequest = {
      userId,
      listingId
    };
    return this.http.post<BaseResponse<FavoriteResponse>>(this.apiUrl, request);
  }

  removeFavorite(userId: string, listingId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}/${listingId}`);
  }

  getFavoritesByUser(userId: string): Observable<BaseResponse<FavoriteResponse[]>> {
    return this.http.get<BaseResponse<FavoriteResponse[]>>(`${this.apiUrl}/${userId}`);
  }

  checkIsFavorite(userId: string, listingId: string): Observable<boolean> {
    return new Observable(observer => {
      this.getFavoritesByUser(userId).subscribe({
        next: (response) => {
          const favorites = response.data || [];
          const isFavorite = favorites.some(fav => fav.listingId === listingId);
          observer.next(isFavorite);
          observer.complete();
        },
        error: (error) => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
} 