import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ApiErrorResponse } from '../models/error.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor() { }

  /**
   * Processes HTTP errors to extract the relevant error message
   * from backend API responses
   */
  handleHttpError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    
    let errorMessage = 'Unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      // Check if we have a structured error response matching our ApiErrorResponse
      const apiError = error.error as ApiErrorResponse;
      
      if (apiError && apiError.details) {
        // Use the specific error details from the backend
        errorMessage = apiError.details;
      } else if (apiError && apiError.message) {
        // Use the error message from the backend
        errorMessage = apiError.message;
      } else {
        // Fallback to status code and message
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 