import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isMenuOpen: boolean = false;
  isLoginPage: boolean = false;
  isRegisterPage: boolean = false;
  isLoggedIn: boolean = false;
  isAgent: boolean = false;
  isAdmin: boolean = false;
  isBuyer: boolean = false;
  isRenter: boolean = false;
  currentUser: any = null;
  private subscriptions: Subscription[] = [];
  private detailsLoadAttempted: boolean = false;
  
  // Track the last seen token to detect changes
  private lastSeenToken: string | null = null;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}
  
  ngOnInit() {
    console.log("HeaderComponent initialized");
    
    // Check if user is logged in
    this.checkAuthStatus();
    
    // Check the initial route
    this.checkCurrentRoute(this.router.url);
    
    // Subscribe to route changes
    const routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkCurrentRoute(event.url);
      // Recheck auth status on navigation
      this.checkAuthStatus();
      
      // If we just came from login page to home, force reload user details
      if (event.url === '/' && this.isLoggedIn && (!this.currentUser || !this.currentUser.name || this.currentUser.name === 'User' || this.currentUser.name === 'Guest')) {
        console.log('Detected navigation to home after login, forcing user details load');
        this.loadUserDetails();
      }
    });
    this.subscriptions.push(routeSub);

    // Subscribe to auth service user updates
    const userSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        console.log('Received user update from auth service:', user);
        this.updateCurrentUser(user);
      }
    });
    this.subscriptions.push(userSub);

    // Add interval to check and update user info if needed
    const intervalId = setInterval(() => {
      // Check for token changes - this can detect new logins
      this.checkForTokenChanges();
      
      if (this.isLoggedIn && (!this.currentUser || !this.currentUser.name || this.currentUser.name === 'User' || this.currentUser.name === 'Guest')) {
        if (!this.detailsLoadAttempted) {
          console.log('Interval check: User logged in but name not loaded correctly, attempting to load details');
          this.loadUserDetails();
          this.detailsLoadAttempted = true;
        }
      } else {
        // Reset the flag if we logout or have proper user info
        this.detailsLoadAttempted = false;
      }
    }, 1000); // Check every second
    
    // Store the interval ID for cleanup
    this.subscriptions.push({ 
      unsubscribe: () => clearInterval(intervalId) 
    } as Subscription);
  }
  
  ngAfterViewInit() {
    // After view is initialized, check again for user details
    setTimeout(() => {
      if (this.isLoggedIn && (!this.currentUser || !this.currentUser.name || this.currentUser.name === 'User' || this.currentUser.name === 'Guest')) {
        console.log('AfterViewInit: User logged in but name not loaded correctly, loading details');
        this.loadUserDetails();
      }
    }, 0);
  }
  
  ngOnDestroy() {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // New method to load user details from token
  loadUserDetails() {
    const token = this.authService.getToken();
    if (token) {
      const userId = this.authService.getUserIdFromToken(token);
      if (userId) {
        console.log("Actively loading user details from UserService for ID:", userId);
        this.userService.getUserById(userId).subscribe({
          next: (user) => {
            console.log("Successfully loaded user details:", user);
            this.updateCurrentUser(user);
            this.authService.updateCurrentUser(user);
          },
          error: (error) => {
            console.error("Error loading user details from UserService:", error);
          }
        });
      }
    }
  }
  
  checkAuthStatus() {
    console.log("Checking auth status...");
    
    // Lấy trạng thái đăng nhập từ AuthService
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log("Is logged in:", this.isLoggedIn);
    
    if (this.isLoggedIn) {
      // Lấy thông tin user từ localStorage
      this.currentUser = this.authService.getCurrentUser();
      console.log("Current user from localStorage:", this.currentUser);
      
      // Nếu đã login nhưng chưa có thông tin user hoặc thông tin chưa đầy đủ
      if (!this.currentUser || !this.currentUser.name || this.currentUser.name === 'User' || this.currentUser.name === 'Guest') {
        // Immediately load user details without waiting
        this.loadUserDetails();
      }
      
      // Đăng ký theo dõi thay đổi của thông tin người dùng
      this.authService.currentUser$.subscribe(user => {
        if (user && user.id) {
          this.updateCurrentUser(user);
        }
      });
      
      // Cập nhật vai trò
      this.isAgent = this.authService.isAgent();
      this.isAdmin = this.authService.isAdmin();
      this.isBuyer = this.authService.isBuyer();
      this.isRenter = this.authService.isRenter();
      console.log("User roles:", { isAgent: this.isAgent, isAdmin: this.isAdmin, isBuyer: this.isBuyer, isRenter: this.isRenter });
    } else {
      this.currentUser = null;
      this.isAgent = false;
      this.isAdmin = false;
      this.isBuyer = false;
      this.isRenter = false;
      console.log("No user logged in");
    }
    
    // Log để kiểm tra
    console.log('Auth status checked:', { isLoggedIn: this.isLoggedIn, isAgent: this.isAgent, isAdmin: this.isAdmin, isBuyer: this.isBuyer, isRenter: this.isRenter });
  }
  
  // Cập nhật thông tin người dùng hiển thị
  updateCurrentUser(user: any) {
    if (!user) return;
    
    console.log("Updating current user with data:", JSON.stringify(user));
    
    // Make a copy to avoid reference issues
    this.currentUser = { ...user };
    
    // Đảm bảo name được hiển thị đúng (priority order)
    if (this.currentUser.name && this.currentUser.name !== 'User' && this.currentUser.name !== 'Guest') {
      // Already has a good name, keep it
      console.log("Using existing name:", this.currentUser.name);
    } else if (this.currentUser.firstName && this.currentUser.lastName) {
      this.currentUser.name = `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
      console.log("Generated name from firstName+lastName:", this.currentUser.name);
    } else if (this.currentUser.firstName) {
      this.currentUser.name = this.currentUser.firstName;
      console.log("Using firstName as name:", this.currentUser.name);
    } else if (this.currentUser.username && this.currentUser.username !== this.currentUser.id) {
      this.currentUser.name = this.currentUser.username;
      console.log("Using username as name:", this.currentUser.name);
    } else if (this.currentUser.email) {
      // Extract name from email (everything before @)
      const emailName = this.currentUser.email.split('@')[0];
      this.currentUser.name = emailName;
      console.log("Using email-derived name:", this.currentUser.name);
    } else {
      this.currentUser.name = 'User';
      console.log("No usable name field found, using 'User'");
    }
    
    // Ensure UI updates by triggering change detection
    setTimeout(() => {
      console.log("Name displayed in header will be:", this.currentUser.name);
    }, 0);
  }
  
  checkCurrentRoute(url: string) {
    this.isLoginPage = url.includes('/login') || url.includes('/auth/login');
    this.isRegisterPage = url.includes('/register') || url.includes('/auth/register');
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.checkAuthStatus();
  }
  
  // Xử lý khi ảnh không tồn tại
  handleImageError(event: any) {
    // Thay thế bằng placeholder image từ CDN (không phụ thuộc vào assets)
    event.target.src = 'https://placehold.co/50x50/3498db/ffffff?text=User';
  }
  
  // Check if the token has changed
  private checkForTokenChanges() {
    const currentToken = this.authService.getToken();
    if (currentToken && currentToken !== this.lastSeenToken) {
      console.log('Token change detected, refreshing user information');
      this.lastSeenToken = currentToken;
      this.isLoggedIn = true;
      this.loadUserDetails();
    } else if (!currentToken && this.lastSeenToken) {
      // Token disappeared, user logged out
      console.log('Token removed, user logged out');
      this.lastSeenToken = null;
      this.isLoggedIn = false;
      this.currentUser = null;
    }
  }
}
