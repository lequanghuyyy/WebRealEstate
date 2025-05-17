import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { OfferRequest, OfferResponse, OfferStatus, BaseResponse } from '../models/offer.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private apiUrl = `${environment.apiUrl}/offers`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  createOffer(offer: OfferRequest): Observable<OfferResponse> {
    return this.http.post<BaseResponse<OfferResponse>>(this.apiUrl, offer)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error creating offer:', error);
          throw error;
        })
      );
  }

  getOffersByListing(listingId: string, page: number = 0): Observable<any> {
    return this.http.get<BaseResponse<any>>(`${this.apiUrl}/listing/${listingId}/${page}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error getting offers for listing ${listingId}:`, error);
          throw error;
        })
      );
  }

  getOffersByUser(userId: string, page: number = 0): Observable<any> {
    return this.http.get<BaseResponse<any>>(`${this.apiUrl}/${userId}/${page}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error getting offers for user ${userId}:`, error);
          throw error;
        })
      );
  }

  deleteOffer(offerId: string): Observable<void> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${offerId}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error deleting offer ${offerId}:`, error);
          throw error;
        })
      );
  }

  acceptOffer(offerId: string): Observable<OfferResponse> {
    console.log(`Sending accept request to: ${this.apiUrl}/${offerId}/accept`);
    // Using empty object as body and adding Content-Type header
    const headers = { 'Content-Type': 'application/json' };
    
    return this.http.patch<BaseResponse<OfferResponse>>(
      `${this.apiUrl}/${offerId}/accept`, 
      {}, 
      { headers }
    ).pipe(
      map(response => {
        console.log('Accept offer response:', response);
        return response.data;
      }),
      catchError(error => {
        console.error(`Error accepting offer ${offerId}:`, error);
        throw error;
      })
    );
  }

  rejectOffer(offerId: string): Observable<OfferResponse> {
    console.log(`Sending reject request to: ${this.apiUrl}/${offerId}/reject`);
    // Using empty object as body and adding Content-Type header
    const headers = { 'Content-Type': 'application/json' };
    
    return this.http.patch<BaseResponse<OfferResponse>>(
      `${this.apiUrl}/${offerId}/reject`, 
      {}, 
      { headers }
    ).pipe(
      map(response => {
        console.log('Reject offer response:', response);
        return response.data;
      }),
      catchError(error => {
        console.error(`Error rejecting offer ${offerId}:`, error);
        throw error;
      })
    );
  }

  getAllOffers(page: number = 0): Observable<any> {
    return this.http.get<BaseResponse<any>>(`${this.apiUrl}/${page}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error(`Error getting all offers:`, error);
          throw error;
        })
      );
  }
} 