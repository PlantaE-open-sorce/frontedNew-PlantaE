import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileFacade } from '../../../../application/facades/profile.facade';
import { PublicProfileViewComponent } from '../public-profile/public-profile.view';
import { TranslatePipe } from '../../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-public-profile-page',
  standalone: true,
  imports: [CommonModule, PublicProfileViewComponent, TranslatePipe],
  templateUrl: './public-profile-page.view.html',
  styleUrls: ['./public-profile-page.view.css']
})
export class PublicProfilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profileFacade = inject(ProfileFacade);
  readonly profile = this.profileFacade.publicProfile;
  readonly isLoading = this.profileFacade.isPublicProfileLoading;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.profileFacade.loadPublicProfile(slug);
      }
    });
  }
}
