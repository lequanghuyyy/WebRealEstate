import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appDefaultImage]',
  standalone: true
})
export class DefaultImageDirective {
  @Input() appDefaultImage: string = 'assets/images/property-1.jpg';

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    this.el.nativeElement.src = this.appDefaultImage;
    this.el.nativeElement.classList.add('error');
  }
} 