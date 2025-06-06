import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  // Login form data
  loginData = {
    username: '',
    password: '',
    rememberMe: true
  };
  
  // UI state
  isLoading = false;
  errorMessage: string | null = null;
  debugInfo: string | null = null;
  registrationSuccess = false;
  redirectUrl: string | null = null;
  
  // Slideshow properties
  currentSlide = 0;
  slideshowInterval: any;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}
  
  ngOnInit() {
    // Start the slideshow
    this.startSlideshow();
    
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.registrationSuccess = true;
      }
      if (params['redirect']) {
        this.redirectUrl = params['redirect'];
      }
    });
    
    // If user is already logged in, redirect based on role
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
    
    this.authService.checkServiceHealth();
  }
  
  ngOnDestroy() {
    // Clear the interval when component is destroyed
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
    }
  }
  
  startSlideshow() {
    // Set the first slide as active
    setTimeout(() => {
      this.setActiveSlide(0);
    }, 0);
    
    // Change slides every 5 seconds
    this.slideshowInterval = setInterval(() => {
      const slides = document.querySelectorAll('.slide');
      this.currentSlide = (this.currentSlide + 1) % slides.length;
      this.setActiveSlide(this.currentSlide);
    }, 5000);
  }
  
  setActiveSlide(index: number) {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }
  
  onSubmit() {
    // Set loading state
    this.isLoading = true;
    this.errorMessage = '';
    
    // Make login request with rememberMe value
    this.authService.login(this.loginData.username, this.loginData.password, this.loginData.rememberMe)
      .subscribe({
        next: (response) => {
          console.log('Login successful');
          
          // Force fetch user details immediately after login
          const userId = this.authService.getUserIdFromToken();
          if (userId) {
            this.authService.fetchUserById(userId).subscribe({
              next: (user) => {
                console.log('User details fetched after login:', user);
                // Update current user in auth service
                this.authService.updateCurrentUser(user);
                
                // Redirect to the original URL the user was trying to access
                if (this.redirectUrl) {
                  this.router.navigateByUrl(this.redirectUrl);
                } else if (user.roles?.includes('ADMIN')) {
                  this.router.navigate(['/admin/dashboard']);
                } else if (user.roles?.includes('AGENT')) {
                  this.router.navigate(['/agent/dashboard']);
                } else {
                  this.router.navigate(['/']);
                }
              },
              error: (error) => {
                console.error('Error fetching user details:', error);
                // Still redirect even if we couldn't fetch details
                if (this.redirectUrl) {
                  this.router.navigateByUrl(this.redirectUrl);
                } else {
                  this.router.navigate(['/']);
                }
              }
            });
          } else {
            // If no userId, just redirect
            if (this.redirectUrl) {
              this.router.navigateByUrl(this.redirectUrl);
            } else {
              this.router.navigate(['/']);
            }
          }
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
          
          // Format user-friendly error message
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password';
          } else if (error.status === 403) {
            this.errorMessage = 'Your account is disabled';
          } else if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'An error occurred during login. Please try again.';
          }
        }
      });
  }
  
  private redirectByRoles(roles: string[]) {
    this.isLoading = false;
    console.log('Redirecting with roles:', roles);
    
    try {
      const currentUser = this.authService.getCurrentUser();
      
      // Nếu là agent và đang chờ xét duyệt, không cho phép vào trang agent
      if (roles.includes('AGENT') && 
          currentUser && 
          currentUser.status === 'PENDING_APPROVAL') {
        console.log('Agent account pending approval, displaying error message');
        this.errorMessage = 'Your agent account is pending approval by an administrator. Please check back later.';
        this.authService.logout(); // Logout để tránh cache trạng thái đăng nhập
        return;
      }
      
      if (roles.includes('ADMIN')) {
        console.log('User has ADMIN role, redirecting to admin dashboard');
        this.router.navigate(['/admin/dashboard']);
      } else if (roles.includes('AGENT')) {
        console.log('User has AGENT role, redirecting to agent dashboard');
        this.router.navigate(['/agent/dashboard']);
      } else if (roles.includes('BUYER') || roles.includes('RENTER') || roles.includes('USER')) {
        console.log('User has BUYER/RENTER/USER role, redirecting to home page');
        this.router.navigate(['/']);
      } else {
        console.log('No specific role found, redirecting to home page as default');
        this.router.navigate(['/']);
      }
    } catch (error) {
      console.error('Error during role-based redirection:', error);
      // Fallback to home page if anything goes wrong
      this.router.navigate(['/']);
    }
  }
  
  private redirectBasedOnRole() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    const roles = user.roles || [];
    
    if (roles.includes('AGENT') && user.status === 'PENDING_APPROVAL') {
      console.log('Agent account pending approval, displaying error message');
      this.errorMessage = 'Your agent account is pending approval by an administrator. Please check back later.';
      this.authService.logout(); // Logout để tránh cache trạng thái đăng nhập
      return;
    }
    
    if (roles.includes('ADMIN')) {
      this.router.navigate(['/admin/dashboard']);
    } else if (roles.includes('AGENT')) {
      this.router.navigate(['/agent/dashboard']);
    } else if (roles.includes('BUYER') || roles.includes('RENTER')) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/']);
    }
  }
  
  loginWithGoogle() {
    // In a real app, implement OAuth flow
  }
  
  loginWithFacebook() {
    // In a real app, implement OAuth flow
  }
} 