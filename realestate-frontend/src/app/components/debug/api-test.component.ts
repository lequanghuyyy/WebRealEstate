import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-api-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <h2>API Connection Tester</h2>
      <div class="mb-4">
        <h3>Environment Settings</h3>
        <pre>{{ environmentInfo }}</pre>
      </div>
      
      <div class="mb-4">
        <h3>Security Service Test</h3>
        <div class="input-group mb-3">
          <input type="text" class="form-control" [(ngModel)]="securityEndpoint" placeholder="Endpoint path (e.g., /auth/health)">
          <button class="btn btn-primary" (click)="testSecurityService()">Test Security Service</button>
        </div>
        <div *ngIf="securityResult" [ngClass]="{'alert': true, 'alert-success': !securityError, 'alert-danger': securityError}">
          <pre>{{ securityResult }}</pre>
        </div>
      </div>
      
      <div class="mb-4">
        <h3>User Experience Service Test</h3>
        <div class="input-group mb-3">
          <input type="text" class="form-control" [(ngModel)]="experienceEndpoint" placeholder="Endpoint path (e.g., /appointments)">
          <button class="btn btn-primary" (click)="testExperienceService()">Test Experience Service</button>
        </div>
        <div *ngIf="experienceResult" [ngClass]="{'alert': true, 'alert-success': !experienceError, 'alert-danger': experienceError}">
          <pre>{{ experienceResult }}</pre>
        </div>
      </div>
      
      <div class="mb-4">
        <h3>Test Login</h3>
        <div class="form-group mb-3">
          <label for="username">Username</label>
          <input type="text" id="username" class="form-control" [(ngModel)]="username" placeholder="Username">
        </div>
        <div class="form-group mb-3">
          <label for="password">Password</label>
          <input type="password" id="password" class="form-control" [(ngModel)]="password" placeholder="Password">
        </div>
        <button class="btn btn-primary" (click)="testLogin()">Test Login</button>
        <div *ngIf="loginResult" [ngClass]="{'alert': true, 'alert-success': !loginError, 'alert-danger': loginError, 'mt-3': true}">
          <pre>{{ loginResult }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 5px;
      max-height: 300px;
      overflow: auto;
    }
  `]
})
export class ApiTestComponent implements OnInit {
  environmentInfo: string = '';
  securityEndpoint: string = '/auth/health';
  experienceEndpoint: string = '/appointments';
  securityResult: string = '';
  experienceResult: string = '';
  securityError: boolean = false;
  experienceError: boolean = false;
  
  username: string = '';
  password: string = '';
  loginResult: string = '';
  loginError: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.environmentInfo = JSON.stringify(environment, null, 2);
  }

  testSecurityService(): void {
    const url = `${environment.apiUrl}/auth${this.securityEndpoint}`;
    console.log(`Testing Security Service at: ${url}`);
    
    this.http.get(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          this.securityError = true;
          return of(JSON.stringify(error, null, 2));
        })
      )
      .subscribe(result => {
        this.securityResult = result;
        if (!this.securityError) {
          try {
            // Try to parse as JSON for nicer formatting
            const jsonResult = JSON.parse(result);
            this.securityResult = JSON.stringify(jsonResult, null, 2);
          } catch (e) {
            // If not JSON, keep as is
          }
        }
      });
  }

  testExperienceService(): void {
    const url = `${environment.apiUrl}/experience${this.experienceEndpoint}`;
    console.log(`Testing User Experience Service at: ${url}`);
    
    this.http.get(url, { responseType: 'text' })
      .pipe(
        catchError(error => {
          this.experienceError = true;
          return of(JSON.stringify(error, null, 2));
        })
      )
      .subscribe(result => {
        this.experienceResult = result;
        this.experienceError = false;
        try {
          // Try to parse as JSON for nicer formatting
          const jsonResult = JSON.parse(result);
          this.experienceResult = JSON.stringify(jsonResult, null, 2);
        } catch (e) {
          // If not JSON, keep as is
        }
      });
  }

  testLogin(): void {
    // Test with proxy only
    const proxyUrl = `${environment.apiUrl}/auth/login`;
    
    const body = {
      username: this.username,
      password: this.password
    };
    
    console.log(`Testing login via proxy at: ${proxyUrl}`);
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Use the proxy
    this.loginResult = "Testing connection...";
    this.http.post(proxyUrl, body, { observe: 'response' })
      .subscribe(response => {
        console.log('Login response:', response);
        this.loginResult = JSON.stringify(response, null, 2);
        this.loginError = !(response.status === 200);
      }, error => {
        console.error('Login error:', error);
        this.loginError = true;
        this.loginResult = JSON.stringify({
          error: error.error,
          status: error.status,
          statusText: error.statusText,
          message: "Connection failed"
        }, null, 2);
      });
  }
} 