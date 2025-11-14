import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileFacade } from '../../../application/facades/profile.facade';
import { PublicProfileViewComponent } from './public-profile.view';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';

@Component({
  selector: 'app-public-profile-page',
  standalone: true,
  imports: [CommonModule, PublicProfileViewComponent, TranslatePipe],
  template: `
    <section>
      <ng-container *ngIf="profile(); else loading">
        <app-public-profile
          [displayName]="profile()?.displayName || ''"
          [bio]="profile()?.bio"
          [location]="profile()?.location"
          [avatarUrl]="profile()?.avatarUrl"
        />
      </ng-container>
      <ng-template #loading>
        <p *ngIf="isLoading(); else notFound">
          {{ 'profile:public.loading' | t:'Cargando perfil...' }}
        </p>
      </ng-template>
      <ng-template #notFound>
        <p>{{ 'profile:public.notFound' | t:'No encontramos este perfil.' }}</p>
      </ng-template>
    </section>
  `
})
export class PublicProfilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profileFacade = inject(ProfileFacade);
  readonly profile = this.profileFacade.publicProfile;
  readonly isLoading = this.profileFacade.isPublicProfileLoading;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.profileFacade.loadPublicProfile(slug);
    }
  }
}
