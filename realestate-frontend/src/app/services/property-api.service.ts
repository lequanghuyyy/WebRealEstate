import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { map, catchError, mergeMap, toArray, retry } from 'rxjs/operators';
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

interface PageListingRequest {
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyApiService {
  // Update API URL to use listings endpoint through API gateway
  private apiUrl = '/api/listings';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Get all listings
  getListings(): Observable<ListingResponse[]> {
    console.log('Calling getListings API: GET', `${this.apiUrl}`);
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}`)
      .pipe(
        retry(1),
        map(response => {
          console.log('Listings API response:', response);
          return response.data;
        }),
        catchError(error => {
          console.error('Error fetching listings:', error);
          return of([]);
        })
      );
  }

  // Get all listings with pagination using the endpoint from your Spring Boot service
  getAllListingsPaged(page: number = 1, size: number = 8): Observable<PageDto<ListingResponse>> {
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      retry(1),
      map(response => {
        return response.data;
      }),
      catchError(error => {
      
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

  // Try alternative methods to get listings if main method fails
  getListingsWithFallback(): Observable<ListingResponse[]> {
    console.log('Trying fallback methods to get listings');
    
    // Try direct API call
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/find`).pipe(
      map(response => {
        console.log('Find endpoint response:', response);
        return response.data;
      }),
      catchError(error => {
        console.log('Find endpoint failed, trying sale endpoint');
        // If it fails, try sale listings
        return this.getListingsBySaleType().pipe(
          catchError(innerError => {
            console.error('Sale endpoint failed, trying rent endpoint');
            return this.getListingsByRentType().pipe(
              catchError(finalError => {
                console.error('All methods failed to get listings');
                return of([]);
              })
            );
          })
        );
      })
    );
  }

  // Search listings with filters
  searchListings(searchRequest: ListingSearchRequest): Observable<PageDto<ListingResponse>> {
    console.log('Calling searchListings API: POST', `${this.apiUrl}/search`, searchRequest);
    
    // Make a copy of the request to avoid modifying the original
    const requestCopy = { ...searchRequest };
    
    // Set default values for page and size if not provided
    if (requestCopy.page === undefined || requestCopy.page === null) {
      requestCopy.page = 1;
    }
    
    if (requestCopy.size === undefined || requestCopy.size === null) {
      requestCopy.size = 8;
    }
    
    return this.http.post<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}/search`, requestCopy)
      .pipe(
        retry(1),
        map(response => {
          console.log('Search API Response:', response);
          return response.data;
        }),
        catchError(error => {
          console.error('Error searching listings:', error);
          
          // If API fails, try to filter locally using the getListings API instead
          if (error.status === 500) {
            console.log('Server error 500, trying client-side filtering as fallback');
            return this.getListingsWithFilters(requestCopy);
          }
          
          return of({
            items: [],
            totalElements: 0,
            totalPages: 0,
            page: requestCopy.page,
            size: requestCopy.size
          } as PageDto<ListingResponse>);
        })
      );
  }
  
  // Client-side filtering as fallback when server API fails
  private getListingsWithFilters(searchRequest: ListingSearchRequest): Observable<PageDto<ListingResponse>> {
    // Ensure page and size are defined with defaults
    const page = searchRequest.page ?? 1;
    const size = searchRequest.size ?? 8;
    
    return this.getListings().pipe(
      map(listings => {
        // Filter listings based on the search request
        let filtered = listings;
        
        // Apply all filters
        if (searchRequest.propertyType) {
          filtered = filtered.filter(item => item.propertyType === searchRequest.propertyType);
        }
        
        if (searchRequest.type) {
          filtered = filtered.filter(item => item.type === searchRequest.type);
        }
        
        if (searchRequest.minPrice) {
          filtered = filtered.filter(item => item.price >= Number(searchRequest.minPrice));
        }
        
        if (searchRequest.maxPrice) {
          filtered = filtered.filter(item => item.price <= Number(searchRequest.maxPrice));
        }
        
        if (searchRequest.minArea) {
          filtered = filtered.filter(item => item.area >= Number(searchRequest.minArea));
        }
        
        if (searchRequest.maxArea) {
          filtered = filtered.filter(item => item.area <= Number(searchRequest.maxArea));
        }
        
        if (searchRequest.bedrooms) {
          filtered = filtered.filter(item => item.bedrooms === Number(searchRequest.bedrooms));
        }
        
        if (searchRequest.bathrooms) {
          filtered = filtered.filter(item => item.bathrooms === Number(searchRequest.bathrooms));
        }
        
        if (searchRequest.city) {
          const cityLower = searchRequest.city.toLowerCase();
          filtered = filtered.filter(item => item.city && item.city.toLowerCase().includes(cityLower));
        }
        
        if (searchRequest.keyword) {
          const keywordLower = searchRequest.keyword.toLowerCase();
          filtered = filtered.filter(item => {
            return (
              (item.title && item.title.toLowerCase().includes(keywordLower)) ||
              (item.description && item.description.toLowerCase().includes(keywordLower)) ||
              (item.address && item.address.toLowerCase().includes(keywordLower)) ||
              (item.city && item.city.toLowerCase().includes(keywordLower))
            );
          });
        }
        
        // Calculate pagination
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);
        
        // Get items for the current page
        const startIndex = (page - 1) * size;
        const endIndex = Math.min(startIndex + size, totalElements);
        const items = filtered.slice(startIndex, endIndex);
        
        // Return as PageDto
        return {
          items,
          totalElements,
          totalPages,
          page,
          size
        } as PageDto<ListingResponse>;
      }),
      catchError(error => {
        console.error('Error in client-side filtering:', error);
        return of({
          items: [],
          totalElements: 0,
          totalPages: 0,
          page,
          size
        } as PageDto<ListingResponse>);
      })
    );
  }

  // Get listing by ID
  getListingById(id: string): Observable<ListingResponse> {
    console.log('Calling getListingById API: GET', `${this.apiUrl}/findById/${id}`);
    return this.http.get<BaseResponse<ListingResponse>>(`${this.apiUrl}/findById/${id}`)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Create a new listing
  createListing(listing: ListingRequest): Observable<ListingResponse> {
    console.log('Calling createListing API: POST', `${this.apiUrl}/create`, listing);
    return this.http.post<BaseResponse<ListingResponse>>(`${this.apiUrl}/create`, listing)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError)
      );
  }
  
  // Update an existing listing
  updateListing(id: string, listing: ListingRequest): Observable<ListingResponse> {
    console.log('Calling updateListing API: PUT', `${this.apiUrl}/update/${id}`, listing);
    return this.http.put<BaseResponse<ListingResponse>>(`${this.apiUrl}/update/${id}`, listing)
      .pipe(
        retry(1),
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Get listings by sale type
  getListingsBySaleType(): Observable<ListingResponse[]> {
    console.log('Calling getListingsBySaleType API: GET', `${this.apiUrl}/sale`);
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/sale`)
      .pipe(
        retry(1),
        map(response => {
          console.log('Sale type API Response:', response);
          return response.data;
        }),
        catchError(error => {
          console.error('Error fetching sale listings:', error);
          return of([]);
        })
      );
  }

  // Get listings by rent type
  getListingsByRentType(): Observable<ListingResponse[]> {
    console.log('Calling getListingsByRentType API: GET', `${this.apiUrl}/rent`);
    return this.http.get<BaseResponse<ListingResponse[]>>(`${this.apiUrl}/rent`)
      .pipe(
        retry(1),
        map(response => {
          console.log('Rent type API Response:', response);
          return response.data;
        }),
        catchError(error => {
          console.error('Error fetching rent listings:', error);
          return of([]);
        })
      );
  }

  // Get listings by sale type (paged)
  getListingsBySaleTypePaged(page: number = 1, size: number = 10): Observable<PageDto<ListingResponse>> {
    console.log('Calling getListingsBySaleTypePaged API: GET', `${this.apiUrl}/sale/paged`);
    
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}/sale/paged`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      retry(1),
      map(response => {
        console.log('Sale type paged API Response:', response);
        return response.data;
      }),
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
    console.log('Calling getListingsByRentTypePaged API: GET', `${this.apiUrl}/rent/paged`);
    
    return this.http.get<BaseResponse<PageDto<ListingResponse>>>(`${this.apiUrl}/rent/paged`, {
      params: {
        page: page.toString(),
        size: size.toString()
      }
    }).pipe(
      retry(1),
      map(response => {
        console.log('Rent type paged API Response:', response);
        return response.data;
      }),
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

  // Debug connectivity to backend
  debugBackendConnectivity(): void {
    console.log('Testing backend connectivity...');
    
    // Test main endpoint
    this.http.get(`${this.apiUrl}`).subscribe({
      next: (response) => console.log('Main endpoint responded:', response),
      error: (err) => console.error('Main endpoint error:', err)
    });
    
    // Test search endpoint
    const testRequest = { page: 1, size: 1 };
    this.http.post(`${this.apiUrl}/search`, testRequest).subscribe({
      next: (response) => console.log('Search endpoint responded:', response),
      error: (err) => console.error('Search endpoint error:', err)
    });
  }
} 