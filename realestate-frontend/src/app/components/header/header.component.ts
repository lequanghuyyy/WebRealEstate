import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

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
  currentUser: any = null;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
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
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.currentUser = this.authService.getCurrentUser();
      this.isAgent = this.authService.isAgent();
    } else {
      this.currentUser = null;
      this.isAgent = false;
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
}
