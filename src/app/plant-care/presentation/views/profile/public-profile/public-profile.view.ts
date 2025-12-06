import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-profile.view.html',
  styleUrls: ['./public-profile.view.css']
})
export class PublicProfileViewComponent {
  @Input() displayName = '';
  @Input() bio?: string;
  @Input() location?: string;
  @Input() avatarUrl?: string;
}
