import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NotificationService } from '../../../infrastructure/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="toast-container" *ngIf="notifications.messages().length">
      <article
        *ngFor="let toast of notifications.messages()"
        [class]="'toast toast--' + toast.type"
      >
        <span>{{ toast.text }}</span>
        <button type="button" (click)="dismiss(toast.id)">×</button>
      </article>
    </section>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        z-index: 1000;
        pointer-events: none;
      }
      .toast {
        min-width: 220px;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        color: #fff;
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        pointer-events: auto;
      }
      .toast--success {
        background: #1e8a4b;
      }
      .toast--error {
        background: #b02a37;
      }
      .toast--info {
        background: #0d6efd;
      }
      button {
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font-size: 1rem;
      }
      @media (max-width: 640px) {
        .toast-container {
          left: 1rem;
          right: 1rem;
        }
      }
    `
  ]
})
export class ToastContainerComponent {
  constructor(public readonly notifications: NotificationService) {}

  dismiss(id: number) {
    this.notifications.remove(id);
  }
}
