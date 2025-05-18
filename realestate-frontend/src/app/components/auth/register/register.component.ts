import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  isLoading = false;
  serverError: string | null = null;
  registrationSuccess = false;
  verificationSent = false;
  
  // Slideshow properties
  currentSlide = 0;
  slideshowInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.pattern(/^\+?[0-9\s\-\(\)]{10,15}$/)],
      role: ['USER', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Start the slideshow
    this.startSlideshow();
    
    // Add conditional validators when role changes
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const phoneControl = this.registerForm.get('phone');
      
      if (role === 'AGENT') {
        phoneControl?.setValidators([Validators.required, Validators.pattern(/^\+?[0-9\s\-\(\)]{10,15}$/)]);
      } else {
        phoneControl?.setValidators([Validators.pattern(/^\+?[0-9\s\-\(\)]{10,15}$/)]);
      }
      
      phoneControl?.updateValueAndValidity();
    });

    // Auto-populate username from email
    this.registerForm.get('email')?.valueChanges.subscribe(email => {
      if (email && !this.registerForm.get('username')?.value) {
        // Use email as the default username (without the domain part)
        const username = email.split('@')[0];
        this.registerForm.get('username')?.setValue(username);
      }
    });
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

  // Check if the selected role is AGENT
  isAgent(): boolean {
    return this.registerForm.get('role')?.value === 'AGENT';
  }

  // Custom validator to check if password and confirm password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // Getters for form controls to use in template
  get emailControl() {
    return this.registerForm.get('email');
  }

  get usernameControl() {
    return this.registerForm.get('username');
  }

  get firstNameControl() {
    return this.registerForm.get('firstName');
  }

  get lastNameControl() {
    return this.registerForm.get('lastName');
  }

  get roleControl() {
    return this.registerForm.get('role');
  }

  get phoneControl() {
    return this.registerForm.get('phone');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword');
  }

  get termsControl() {
    return this.registerForm.get('termsAccepted');
  }

  onSubmit(): void {
    // Mark all fields as touched to trigger validation
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });

    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.serverError = null;

    const formData = this.registerForm.value;
    
    // Map roles according to backend expectations
    let roles: string[] = [];
    if (formData.role === 'AGENT') {
      roles = ['AGENT'];
    } else {
      // For Home Seekers, set both BUYER and RENTER roles
      roles = ['BUYER', 'RENTER'];
    }
    
    // Create a registration object with the form data formatted for the Spring backend
    const registrationData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || '',
      roles: roles // Set the roles array based on the selected role
    };

    console.log('Sending registration data to backend:', registrationData);

    // Call the auth service to register the user
    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.registrationSuccess = true;
        console.log('Registration successful:', response);
        
        if (formData.role === 'AGENT') {
          // For agents, show a verification message and stay on the page
          this.verificationSent = true;
        } else {
          // For regular users, redirect to login
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'success' } 
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        
        if (error.status === 409 || 
            (error.error && typeof error.error === 'string' && error.error.includes('already exists')) ||
            (error.error && error.error.message && error.error.message.includes('already exists'))) {
          this.serverError = 'This username or email is already registered. Please try another one.';
        } else if (error.status === 400 || error.message?.includes('Invalid')) {
          this.serverError = 'Invalid registration data. Please check your information.';
        } else {
          this.serverError = error.message || 'Registration failed. Please try again later.';
        }
      }
    });
  }

  loginWithGoogle(): void {
    console.log('Google login clicked');
    // Implement Google OAuth logic here
  }

  loginWithFacebook(): void {
    console.log('Facebook login clicked');
    // Implement Facebook OAuth logic here
  }
} 