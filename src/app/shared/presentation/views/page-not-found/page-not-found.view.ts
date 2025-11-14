import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="not-found">
      <h2>404</h2>
      <p>La página que buscas no existe.</p>
      <a routerLink="/">Volver al inicio</a>
    </section>
  `,
  styles: [
    `
      .not-found {
        text-align: center;
        padding: 4rem 0;
      }
      .not-found h2 {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
    `
  ]
})
export class PageNotFoundViewComponent {}
