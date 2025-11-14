import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="public-profile">
      <img *ngIf="avatarUrl" [src]="avatarUrl" alt="Avatar" />
      <h2>{{ displayName }}</h2>
      <p>{{ bio }}</p>
      <small>{{ location }}</small>
    </section>
  `
})
export class PublicProfileViewComponent {
  @Input() displayName = '';
  @Input() bio?: string;
  @Input() location?: string;
  @Input() avatarUrl?: string;
}
