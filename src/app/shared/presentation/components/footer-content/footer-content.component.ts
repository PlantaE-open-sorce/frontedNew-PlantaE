import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-footer-content',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <footer class="footer">
      <p class="footer__tagline">{{ 'footer:slogan' | t:'Cultiva con datos, decide con confianza.' }}</p>
      <span>&copy; {{ year }} PlantaE · {{ 'footer:rights' | t:'Todos los derechos reservados.' }}</span>
    </footer>
  `,
  styles: [
    `
      .footer {
        padding: 1rem;
        text-align: center;
        color: #666;
        font-size: 0.85rem;
      }
      .footer__tagline {
        margin: 0;
        font-size: 0.9rem;
        color: var(--color-primary);
      }
    `
  ]
})
export class FooterContentComponent {
  readonly year = new Date().getFullYear();
}
