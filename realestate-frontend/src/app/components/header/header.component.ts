import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isMenuOpen: boolean = false;
  isLoginPage: boolean = false;
  isRegisterPage: boolean = false;
  isLoggedIn: boolean = false;
  isAgent: boolean = false;
  isAdmin: boolean = false;
  currentUser: any = null;
  
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
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkCurrentRoute(event.url);
      // Recheck auth status on navigation
      this.checkAuthStatus();
    });
  }
  
  checkAuthStatus() {
    console.log("Checking auth status...");
    
    // Lấy trạng thái đăng nhập từ AuthService
    this.isLoggedIn = this.authService.isLoggedIn();
    console.log("Is logged in:", this.isLoggedIn);
    
    if (this.isLoggedIn) {
      // Lấy thông tin user từ localStorage
      this.currentUser = this.authService.getCurrentUser();
      console.log("Current user:", this.currentUser);
      
      // Đăng ký theo dõi thay đổi của thông tin người dùng
      this.authService.currentUser$.subscribe(user => {
        if (user && user.id) {
          this.updateCurrentUser(user);
        }
      });
      
      // Cập nhật vai trò
      this.isAgent = this.authService.isAgent();
      this.isAdmin = this.authService.isAdmin();
      console.log("User roles:", { isAgent: this.isAgent, isAdmin: this.isAdmin });
    } else {
      this.currentUser = null;
      this.isAgent = false;
      this.isAdmin = false;
      console.log("No user logged in");
    }
    
    // Log để kiểm tra
    console.log('Auth status checked:', { isLoggedIn: this.isLoggedIn, isAgent: this.isAgent, isAdmin: this.isAdmin });
  }
  
  // Cập nhật thông tin người dùng hiển thị
  updateCurrentUser(user: any) {
    this.currentUser = user;
    
    // Đảm bảo name được hiển thị đúng
    if (this.currentUser) {
      if (this.currentUser.firstName && this.currentUser.lastName) {
        this.currentUser.name = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
      } else if (this.currentUser.username && this.currentUser.username !== this.currentUser.id) {
        this.currentUser.name = this.currentUser.username;
      } else {
        this.currentUser.name = 'User';
      }
    }
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
}
