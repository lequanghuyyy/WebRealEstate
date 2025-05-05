import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastrWrapperService {
  private toastContainer: HTMLElement | null = null;

  constructor() {
    this.createToastContainer();
  }

  private createToastContainer(): void {
    if (typeof document !== 'undefined') {
      this.toastContainer = document.getElementById('toast-container');
      
      if (!this.toastContainer) {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'toast-container toast-top-right';
        document.body.appendChild(this.toastContainer);
      }
    }
  }

  private showToast(message: string, type: string): void {
    if (!this.toastContainer) {
      this.createToastContainer();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    toast.setAttribute('role', 'alert');
    
    this.toastContainer?.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode === this.toastContainer) {
        this.toastContainer?.removeChild(toast);
      }
    }, 5000);
    
    // Allow clicking to dismiss
    toast.addEventListener('click', () => {
      if (toast.parentNode === this.toastContainer) {
        this.toastContainer?.removeChild(toast);
      }
    });
  }

  success(message: string): void {
    this.showToast(message, 'success');
  }

  error(message: string): void {
    this.showToast(message, 'error');
  }

  warning(message: string): void {
    this.showToast(message, 'warning');
  }
} 