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
        [class]="'toast toast--' + toast.type + ' animate-slide-in'"
      >
        <div class="toast__icon">
          <svg *ngIf="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <svg *ngIf="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          <svg *ngIf="toast.type === 'info'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <span class="toast__text">{{ toast.text }}</span>
        <button type="button" class="toast__close" (click)="dismiss(toast.id)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </article>
    </section>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .toast-container {
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        z-index: 1000;
        pointer-events: none;
        /* Ensure no background or border on the container itself */
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
      }
      .toast {
        min-width: 300px;
        max-width: 400px;
        padding: 1rem;
        border-radius: 1rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        color: var(--color-text);
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        box-shadow: var(--shadow-lg);
        pointer-events: auto;
        border: 1px solid rgba(0, 0, 0, 0.05);
        overflow: hidden;
        position: relative;
      }
      .toast::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }
      .toast--success::before { background: #2f855a; }
      .toast--error::before { background: #c53030; }
      .toast--info::before { background: #3182ce; }

      .toast__icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .toast--success .toast__icon { color: #2f855a; }
      .toast--error .toast__icon { color: #c53030; }
      .toast--info .toast__icon { color: #3182ce; }

      .toast__icon svg {
        width: 20px;
        height: 20px;
      }

      .toast__text {
        flex: 1;
        font-size: 0.9rem;
        font-weight: 500;
        line-height: 1.5;
        padding-top: 0.1rem;
      }

      .toast__close {
        border: none;
        background: transparent;
        color: var(--color-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.375rem;
        transition: background 0.2s, color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .toast__close:hover {
        background: rgba(0, 0, 0, 0.05);
        color: var(--color-text);
      }
      .toast__close svg {
        width: 16px;
        height: 16px;
      }

      .animate-slide-in {
        animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
      }

      @media (max-width: 640px) {
        .toast-container {
          left: 1rem;
          right: 1rem;
          top: 1rem;
        }
        .toast {
          min-width: auto;
          width: 100%;
        }
      }
    `
  ]
})
export class ToastContainerComponent {
  constructor(public readonly notifications: NotificationService) { }

  dismiss(id: number) {
    this.notifications.remove(id);
  }
}
