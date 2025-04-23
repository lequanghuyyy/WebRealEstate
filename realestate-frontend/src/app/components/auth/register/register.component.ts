import { Component, OnInit } from '@angular/core';
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
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  serverError: string | null = null;
  registrationSuccess = false;
  verificationSent = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', Validators.required],
      role: ['', Validators.required],
      phoneNumber: [''],
      licenseNumber: [''],
      agencyName: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      termsAccepted: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Add conditional validators when role changes
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      const phoneNumberControl = this.registerForm.get('phoneNumber');
      
      if (role === 'propertyOwner') {
        phoneNumberControl?.setValidators([Validators.required]);
      } else {
        phoneNumberControl?.clearValidators();
      }
      
      phoneNumberControl?.updateValueAndValidity();
    });
  }

  // Check if the selected role is Property Owner/Agent
  isPropertyOwner(): boolean {
    return this.registerForm.get('role')?.value === 'propertyOwner';
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

  get fullNameControl() {
    return this.registerForm.get('fullName');
  }

  get roleControl() {
    return this.registerForm.get('role');
  }

  get phoneNumberControl() {
    return this.registerForm.get('phoneNumber');
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
    const isAgent = formData.role === 'propertyOwner';

    // Create a registration object with the form data
    const registrationData = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      role: isAgent ? 'agent' : 'user',
      status: isAgent ? 'pending' : 'active',
      // Include agent-specific data if the role is propertyOwner
      ...(isAgent && {
        phoneNumber: formData.phoneNumber,
        licenseNumber: formData.licenseNumber || null,
        agencyName: formData.agencyName || null,
      })
    };

    // Call the auth service to register the user
    this.authService.registerWithRole(registrationData).subscribe({
      next: (response: { success: boolean, requiresVerification?: boolean, message: string }) => {
        this.isLoading = false;
        this.registrationSuccess = true;
        
        if (isAgent) {
          // For agents, show a verification message and stay on the page
          this.verificationSent = true;
        } else {
          // For regular users, redirect to login
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'success' } 
          });
        }
      },
      error: (error: { status: number, error: string }) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.serverError = 'This email is already registered. Please try another one.';
        } else {
          this.serverError = 'Registration failed. Please try again later.';
        }
        console.error('Registration error:', error);
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