import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TourService } from '../../../infrastructure/services/tour.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-tour-overlay',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="tour animate-slide-up" *ngIf="service.isActive() && service.currentStep() as step">
      <div class="tour__header">
        <div class="tour__badge">{{ 'tour:badge' | t:'Recorrido' }}</div>
        <button class="tour__close" (click)="service.skip()" aria-label="Cerrar tour">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <h4>{{ service.translate(step).title }}</h4>
      <p>{{ service.translate(step).body }}</p>
      <div class="tour__actions">
        <div class="tour__steps">
          <!-- Optional: Step indicators could go here -->
        </div>
        <div class="tour__buttons">
          <button class="btn btn--ghost btn--small" type="button" (click)="service.skip()">
            {{ 'tour:skip' | t:'Omitir' }}
          </button>
          <button class="btn btn--small" type="button" (click)="service.next()">
            {{ 'tour:next' | t:'Siguiente' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .tour {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: min(380px, 90vw);
        background: rgba(15, 61, 46, 0.95);
        backdrop-filter: blur(12px);
        color: #fff;
        border-radius: 1.25rem;
        padding: 1.5rem;
        box-shadow: 
          0 20px 50px rgba(0,0,0,0.3),
          0 10px 20px rgba(0,0,0,0.2);
        z-index: 50;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .tour__header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
      }
      .tour h4 {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: -0.01em;
      }
      .tour p {
        margin: 0 0 1.5rem;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
        line-height: 1.6;
      }
      .tour__badge {
        font-size: 0.7rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.15);
        padding: 0.25rem 0.6rem;
        border-radius: 100px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
      }
      .tour__close {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tour__close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .tour__actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .tour__buttons {
        display: flex;
        gap: 0.75rem;
        margin-left: auto;
      }
      .tour .btn {
        box-shadow: none;
        border-radius: 0.75rem;
      }
      .tour .btn--ghost {
        color: rgba(255, 255, 255, 0.8);
        border-color: rgba(255, 255, 255, 0.2);
      }
      .tour .btn--ghost:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .tour .btn:not(.btn--ghost) {
        background: #fff;
        color: var(--color-primary);
      }
      .tour .btn:not(.btn--ghost):hover {
        background: rgba(255, 255, 255, 0.9);
      }
      
      .animate-slide-up {
        animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 600px) {
        .tour {
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          width: auto;
        }
      }
    `
  ]
})
export class TourOverlayComponent {
  readonly service = inject(TourService);
}
