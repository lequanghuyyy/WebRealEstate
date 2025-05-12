import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { 
  UserResponse, 
  UserUpdateRequest, 
  UserCreationRequest, 
  BaseResponse 
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;
  
  constructor(private http: HttpClient) { }
  
  // Helper method to get auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('No authentication token available');
    }
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }
  
  // Helper method to handle API errors
  private handleError(error: HttpErrorResponse, operation: string = 'operation'): Observable<never> {
    console.error(`Error in ${operation}:`, error);
    let errorMsg = '';
    
    if (error.status === 401 || error.status === 403) {
      errorMsg = 'Authentication error - please log in again';
    } else if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMsg = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMsg = `Error Code: ${error.status}, Message: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMsg));
  }
  
  getUserById(userId: string): Observable<UserResponse> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<BaseResponse<UserResponse>>(`${this.apiUrl}/users/${userId}`, options)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error, 'getUserById'))
      );
  }
  
  getAllUsers(): Observable<UserResponse[]> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<BaseResponse<UserResponse[]>>(`${this.apiUrl}/users`, options)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error, 'getAllUsers'))
      );
  }
  
  updateUser(updateRequest: UserUpdateRequest): Observable<UserResponse> {
    console.log('Updating user with data:', updateRequest);
    
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<BaseResponse<UserResponse>>(`${this.apiUrl}/users/update`, updateRequest, options)
      .pipe(
        map(response => {
          console.log('Update response:', response);
          return response.data;
        }),
        catchError(error => this.handleError(error, 'updateUser'))
      );
  }
  
  // Admin operations
  getPendingAgents(): Observable<UserResponse[]> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.get<BaseResponse<UserResponse[]>>(`${this.apiUrl}/admin/users/pending-agents`, options)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error, 'getPendingAgents'))
      );
  }
  
  approveAgent(userId: string): Observable<UserResponse> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<BaseResponse<UserResponse>>(`${this.apiUrl}/admin/users/${userId}/approve`, {}, options)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error, 'approveAgent'))
      );
  }
  
  rejectAgent(userId: string): Observable<UserResponse> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.put<BaseResponse<UserResponse>>(`${this.apiUrl}/admin/users/${userId}/reject`, {}, options)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error, 'rejectAgent'))
      );
  }
  
  deleteUser(userId: string): Observable<string> {
    const options = { headers: this.getAuthHeaders() };
    return this.http.delete<BaseResponse<string>>(`${this.apiUrl}/users/${userId}`, options)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error, 'deleteUser'))
      );
  }
  
}