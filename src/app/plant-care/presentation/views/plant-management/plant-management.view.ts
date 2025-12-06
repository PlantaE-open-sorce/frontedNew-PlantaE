import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { I18nService } from '../../../../shared/infrastructure/services/i18n.service';

import { ConfirmationModalComponent } from '../../../../shared/presentation/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-plant-management-view',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, ConfirmationModalComponent],
  templateUrl: './plant-management.view.html',
  styleUrls: ['./plant-management.view.css']
})
export class PlantManagementViewComponent implements OnInit {
  private readonly plantFacade = inject(PlantFacade);
  private readonly i18n = inject(I18nService);
  readonly plants = this.plantFacade.plants;
  readonly loading = this.plantFacade.loading;

  ngOnInit(): void {
    this.i18n.loadNamespace('plants');
    this.plantFacade.loadPlants();
  }

  showDeleteModal = false;
  plantToDeleteId: string | null = null;

  delete(id: string) {
    this.plantToDeleteId = id;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (this.plantToDeleteId) {
      this.plantFacade.deletePlant(this.plantToDeleteId);
      this.plantToDeleteId = null;
    }
    this.showDeleteModal = false;
  }

  trackById(_: number, plant: { id: string }) {
    return plant.id;
  }
}
