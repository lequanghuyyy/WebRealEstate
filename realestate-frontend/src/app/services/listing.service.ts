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
  ListingType,
  ListingImageResponse
} from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = 'api/listings';

  constructor(private http: HttpClient) { }

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

  getFeaturedListings(limit: number = 6): Observable<ListingResponse[]> {
    const headers = {
      'Accept': 'application/json'
    };
        return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/byViews`, { headers })
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
          console.error(`Error updating listing status for ID ${id}:`, error);
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
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}`, { 
      params: { 
        page: page.toString(), 
        size: size.toString() 
      } 
    })
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

  // Private method to handle HTTP errors
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      
      // Let the app keep running by returning a safe result
      return of(result as T);
    };
  }

  // Get sale listings with pagination
  getListingsBySaleTypePaged(page: number = 1, size: number = 10): Observable<PageDto<ListingResponse>> {
    const url = `${this.apiUrl}/sale/paged?page=${page}&size=${size}`;
    
    
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(url)
      .pipe(
        map(response => {
          console.log('Sale listings response:', response);
          return response.data;
        }),
        catchError(this.handleError<PageDto<ListingResponse>>('getListingsBySaleTypePaged', {
          items: [],
          totalElements: 0,
          totalPages: 0,
          page: page,
          size: size
        }))
      );
  }

  // Get rent listings with pagination
  getListingsByRentTypePaged(page: number = 1, size: number = 10): Observable<PageDto<ListingResponse>> {
    const url = `${this.apiUrl}/rent/paged?page=${page}&size=${size}`;
    console.log(`Fetching rental listings from ${url}`);
    
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(url)
      .pipe(
        map(response => {
          console.log('Rent listings response:', response);
          return response.data;
        }),
        catchError(this.handleError<PageDto<ListingResponse>>('getListingsByRentTypePaged', {
          items: [],
          totalElements: 0,
          totalPages: 0,
          page: page,
          size: size
        }))
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

  // Get listings by agent ID and type
  getAgentListings(agentId: string, type?: ListingType): Observable<ListingResponse[]> {
    return this.getListingsByOwnerId(agentId)
      .pipe(
        map(listings => {
          if (type) {
            return listings.filter(listing => listing.type === type);
          }
          return listings;
        }),
        catchError(error => {
          console.error(`Error fetching listings for agent ${agentId}:`, error);
          return of([]);
        })
      );
  }

  // Get pending rental requests for an agent
  getRentalRequests(agentId: string): Observable<any[]> {
    return this.http.get<BaseResponse<any[]>>(`${this.apiUrl}/agent/${agentId}/rental-requests`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error fetching rental requests for agent ${agentId}:`, error);
          return of([]);
        })
      );
  }

  // Get active rentals for an agent
  getActiveRentals(agentId: string): Observable<any[]> {
    return this.http.get<BaseResponse<any[]>>(`${this.apiUrl}/agent/${agentId}/active-rentals`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error fetching active rentals for agent ${agentId}:`, error);
          return of([]);
        })
      );
  }

  // Approve a rental request
  approveRentalRequest(requestId: string): Observable<any> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/rental-requests/${requestId}/approve`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error approving rental request ${requestId}:`, error);
          throw error;
        })
      );
  }

  // Reject a rental request
  rejectRentalRequest(requestId: string): Observable<any> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/rental-requests/${requestId}/reject`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error rejecting rental request ${requestId}:`, error);
          throw error;
        })
      );
  }

  // Mark a rental as completed
  completeRental(rentalId: string): Observable<any> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/rentals/${rentalId}/complete`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error completing rental ${rentalId}:`, error);
          throw error;
        })
      );
  }

  // Cancel a rental
  cancelRental(rentalId: string): Observable<any> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/rentals/${rentalId}/cancel`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error cancelling rental ${rentalId}:`, error);
          throw error;
        })
      );
  }

  // Image related methods

  /**
   * Get all images for a listing
   * @param listingId The ID of the listing
   */
  getListingImages(listingId: string): Observable<ListingImageResponse[]> {
    return this.http.get<BaseResponse<ListingImageResponse[]>>(`${this.apiUrl}/${listingId}/images`)
      .pipe(
        map(response => {
          // Kiểm tra nếu không có ảnh nào, trả về ảnh mặc định
          if (!response.data || response.data.length === 0) {
            // Sử dụng ảnh property-1.jpg từ thư mục assets/images
            const defaultImage: ListingImageResponse = {
              id: 'default',
              listingId: listingId,
              imageUrl: 'assets/images/property-1.jpg',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            return [defaultImage];
          }
          return response.data;
        }),
        catchError(error => {
          console.error(`Error fetching images for listing ${listingId}:`, error);
          // Trả về ảnh mặc định nếu có lỗi
          const defaultImage: ListingImageResponse = {
            id: 'default',
            listingId: listingId,
            imageUrl: 'assets/images/property-1.jpg',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          return of([defaultImage]);
        })
      );
  }

  /**
   * Set an image as the main image for a listing
   * @param listingId The ID of the listing
   * @param imageId The ID of the image to set as main
   */
  setMainImage(listingId: string, imageId: string): Observable<void> {
    return this.http.put<BaseResponse<void>>(`${this.apiUrl}/${listingId}/images/setMain/${imageId}`, {})
      .pipe(
        map(() => void 0),
        catchError(error => {
          console.error(`Error setting main image for listing ${listingId}:`, error);
          throw error;
        })
      );
  }

  /**
   * Get the main image URL for a listing
   * @param listingId The ID of the listing
   */
  getMainImageUrl(listingId: string): Observable<string> {
    return this.http.get<BaseResponse<string>>(`${this.apiUrl}/${listingId}/mainImage`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error getting main image URL for listing ${listingId}:`, error);
          // Return default image URL if error
          return of('assets/images/property-1.jpg');
        })
      );
  }

  // Modify uploadListingImage to set first image as main if none exists
  uploadListingImage(listingId: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('setAsMain', 'true'); // Add parameter to set as main if it's the first image

    return this.http.post<BaseResponse<string>>(`${this.apiUrl}/${listingId}/images/upload`, formData)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error uploading image for listing ${listingId}:`, error);
          throw error;
        })
      );
  }

  /**
   * Upload multiple images for a listing
   * @param listingId The ID of the listing
   * @param files The image files to upload
   */
  uploadMultipleListingImages(listingId: string, files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<BaseResponse<string[]>>(`${this.apiUrl}/${listingId}/images/uploadMultiple`, formData)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error uploading multiple images for listing ${listingId}:`, error);
          throw error;
        })
      );
  }

  // Modify existing replaceListingImage method to update mainURL if needed
  replaceListingImage(imageId: string, file: File, isMain: boolean = false): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    if (isMain) {
      formData.append('isMain', 'true');
    }

    return this.http.put<BaseResponse<string>>(`${this.apiUrl}/images/${imageId}`, formData)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error replacing image with ID ${imageId}:`, error);
          throw error;
        })
      );
  }

  // Modify existing deleteListingImage method to update mainURL if needed
  deleteListingImage(imageId: string, listingId: string): Observable<void> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/images/${imageId}?listingId=${listingId}`)
      .pipe(
        map(() => void 0),
        catchError(error => {
          console.error(`Error deleting image with ID ${imageId}:`, error);
          throw error;
        })
      );
  }
} 