import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-plant-care-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './plant-care-shell.html',
  styleUrl: './plant-care-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlantCareShellComponent {}
