import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  isSubmitted: boolean = false;
  isEmailSent: boolean = false;
  errorMessage: string = '';
  
  resetPassword() {
    this.isSubmitted = true;
    
    // Validate email
    if (!this.email || !this.validateEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }
    
    // In a real application, this would make an API call to send a reset email
    console.log('Password reset requested for:', this.email);
    
    // Simulate successful email sending
    setTimeout(() => {
      this.isEmailSent = true;
      this.errorMessage = '';
    }, 1500);
  }
  
  validateEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }
  
  requestNewLink() {
    this.isEmailSent = false;
    this.isSubmitted = false;
    this.errorMessage = '';
  }
} 