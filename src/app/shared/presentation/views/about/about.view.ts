import { Component } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-about-view',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section>
      <h2>{{ 'about:title' | t:'Acerca de PlantaE' }}</h2>
      <p>{{ 'about:description' | t:'Plataforma para monitorear la salud de tus cultivos, integrar sensores IoT, gestionar alertas y generar reportes automatizados.' }}</p>
    </section>
  `
})
export class AboutViewComponent {}
