import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
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

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  empty: boolean;
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
  private favoriteIds: string[] = [];
  public favorites$ = new BehaviorSubject<string[]>([]);

  constructor(private http: HttpClient) { }

  addFavorite(userId: string, listingId: string): Observable<BaseResponse<FavoriteResponse>> {
    const request: FavoriteRequest = {
      userId,
      listingId
    };
    return new Observable(observer => {
      this.http.post<BaseResponse<FavoriteResponse>>(this.apiUrl, request).subscribe({
        next: (response) => {
          // Update favorites list
          if (!this.favoriteIds.includes(listingId)) {
            this.favoriteIds.push(listingId);
            this.favorites$.next([...this.favoriteIds]);
          }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  removeFavorite(userId: string, listingId: string): Observable<any> {
    console.log(`Removing favorite - userId: ${userId}, listingId: ${listingId}`);
    return new Observable(observer => {
      this.http.delete<any>(`${this.apiUrl}/${userId}/${listingId}`).subscribe({
        next: (response) => {
          // Update favorites list
          const index = this.favoriteIds.indexOf(listingId);
          if (index > -1) {
            this.favoriteIds.splice(index, 1);
            this.favorites$.next([...this.favoriteIds]);
          }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getFavoritesByUser(userId: string): Observable<BaseResponse<FavoriteResponse[]>> {
    return new Observable(observer => {
      this.http.get<BaseResponse<FavoriteResponse[]>>(`${this.apiUrl}/${userId}`).subscribe({
        next: (response) => {
          // Update favorites list
          if (response.data) {
            this.favoriteIds = response.data.map(fav => fav.listingId);
            this.favorites$.next([...this.favoriteIds]);
          }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getFavoritesByUserPaginated(userId: string, page: number = 0): Observable<BaseResponse<PageResponse<FavoriteResponse>>> {
    return this.http.get<BaseResponse<PageResponse<FavoriteResponse>>>(`${this.apiUrl}/${userId}?page=${page}`);
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