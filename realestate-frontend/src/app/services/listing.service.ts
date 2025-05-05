import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, catchError, mergeMap, toArray } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  ListingResponse, 
  ListingRequest, 
  BaseResponse, 
  PageDto, 
  ListingSearchRequest, 
  ListingStatusUpdateRequest,
  ListingType
} from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = '/api/listing';

  constructor(private http: HttpClient) { }

  // Get all listings
  getListings(): Observable<ListingResponse[]> {
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/find`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching listings:', error);
          return of([]);
        })
      );
  }

  // Get featured listings - get top listings with most views
  getFeaturedListings(limit: number = 6): Observable<ListingResponse[]> {
    console.log('Calling getFeaturedListings, sử dụng API trực tiếp đã kiểm tra thành công');
    
    const headers = {
      'Accept': 'application/json'
    };
    
    // Sử dụng URL trực tiếp đã được xác minh là hoạt động
    return this.http.get<any>('http://localhost:8080/api/v1/listings/byViews', { headers })
      .pipe(
        map(response => {
          console.log('API response:', response);
          
          if (response && response.data && Array.isArray(response.data)) {
            console.log('Response data array length:', response.data.length);
            return response.data.slice(0, limit);
          } else if (response && Array.isArray(response)) {
            return response.slice(0, limit);
          } else {
            console.error('Unexpected response structure:', response);
            return [];
          }
        }),
        catchError(error => {
          console.error('API error:', error);
          return this.getFeaturedListingsFallback(limit);
        })
      );
  }

  // Fallback method in case the byViews endpoint is not available
  private getFeaturedListingsFallback(limit: number = 6): Observable<ListingResponse[]> {
    console.log('Using fallback method to get featured listings');
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/find`)
      .pipe(
        map(response => {
          console.log('Fallback API response:', response);
          // Sort by views (highest first) and take the specified limit
          return response.data
            .sort((a, b) => (b.view || 0) - (a.view || 0))
            .slice(0, limit);
        }),
        catchError(error => {
          console.error('Error in fallback method:', error);
          return of([]);
        })
      );
  }

  // Get listing by ID
  getListingById(id: string): Observable<ListingResponse> {
    return this.http.get<BaseResponse<ListingResponse>>(`${this.apiUrl}/findById/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error fetching listing with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Get listings by owner ID
  getListingsByOwnerId(ownerId: string): Observable<ListingResponse[]> {
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/findByOwnerId/${ownerId}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error fetching listings for owner ${ownerId}:`, error);
          return of([]);
        })
      );
  }

  // Create a new listing
  createListing(listing: ListingRequest): Observable<ListingResponse> {
    return this.http.post<BaseResponse<ListingResponse>>(`${this.apiUrl}/create`, listing)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error creating listing:', error);
          throw error;
        })
      );
  }

  // Update an existing listing
  updateListing(id: string, listing: ListingRequest): Observable<ListingResponse> {
    return this.http.put<BaseResponse<ListingResponse>>(`${this.apiUrl}/update/${id}`, listing)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error updating listing with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Update listing status
  updateListingStatus(id: string, statusRequest: ListingStatusUpdateRequest): Observable<ListingResponse> {
    return this.http.put<BaseResponse<ListingResponse>>(`${this.apiUrl}/updateStatus/${id}`, statusRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error updating status for listing ${id}:`, error);
          throw error;
        })
      );
  }

  // Delete a listing
  deleteListing(id: string): Observable<void> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/delete/${id}`)
      .pipe(
        map(() => void 0),
        catchError(error => {
          console.error(`Error deleting listing with ID ${id}:`, error);
          throw error;
        })
      );
  }

  // Search listings with filters
  searchListings(searchRequest: ListingSearchRequest): Observable<PageDto<ListingResponse>> {
    return this.http.post<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}/search`, searchRequest)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error searching listings:', error);
          return of({
            items: [],
            totalElements: 0,
            totalPages: 0,
            page: searchRequest.page || 1,
            size: searchRequest.size || 10
          } as PageDto<ListingResponse>);
        })
      );
  }

  // Get listings with pagination
  getListingsPaged(page: number = 1, size: number = 10): Observable<PageDto<ListingResponse>> {
    const request = { page, size };
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}`, { params: { page: page.toString(), size: size.toString() } })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching paged listings:', error);
          return of({
            items: [],
            totalElements: 0,
            totalPages: 0,
            page: page,
            size: size
          } as PageDto<ListingResponse>);
        })
      );
  }

  // Get listings by sale type
  getListingsBySaleType(): Observable<ListingResponse[]> {
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/sale`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching sale listings:', error);
          return of([]);
        })
      );
  }

  // Get listings by rent type
  getListingsByRentType(): Observable<ListingResponse[]> {
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/rent`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching rent listings:', error);
          return of([]);
        })
      );
  }

  // Get sale listings with pagination
  getListingsBySaleTypePaged(page: number = 1, size: number = 10): Observable<PageDto<ListingResponse>> {
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}/sale/paged?page=${page}&size=${size}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching paged sale listings:', error);
          return of({
            items: [],
            totalElements: 0,
            totalPages: 0,
            page: page,
            size: size
          } as PageDto<ListingResponse>);
        })
      );
  }

  // Get rent listings with pagination
  getListingsByRentTypePaged(page: number = 1, size: number = 10): Observable<PageDto<ListingResponse>> {
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}/rent/paged?page=${page}&size=${size}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching paged rent listings:', error);
          return of({
            items: [],
            totalElements: 0,
            totalPages: 0,
            page: page,
            size: size
          } as PageDto<ListingResponse>);
        })
      );
  }

  // Get listings by multiple IDs
  getListingsByIds(ids: string[]): Observable<ListingResponse[]> {
    if (!ids || ids.length === 0) {
      return of([]);
    }
    
    // Since there's no direct endpoint for fetching multiple listings by IDs,
    // we'll have to get each listing individually and combine them
    return from(ids).pipe(
      mergeMap(id => this.getListingById(id).pipe(
        catchError(() => of(null)) // If one listing fails, continue with null
      )),
      toArray(),
      map(listings => listings.filter(listing => listing !== null) as ListingResponse[])
    );
  }
} 