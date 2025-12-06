import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PlantFacade } from '../../../application/facades/plant.facade';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SensorRepository } from '../../../domain/repositories/sensor.repository';
import { SpeciesCatalogService, SpeciesCategory, SpeciesGroup } from '../../../../shared/infrastructure/services/species-catalog.service';
@Component({
  selector: 'app-add-plant-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './add-plant.view.html',
  styleUrl: './add-plant.view.css'
})
export class AddPlantViewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly plantFacade = inject(PlantFacade);
  private readonly router = inject(Router);
  private readonly sensorRepository = inject(SensorRepository);
  private readonly speciesCatalog = inject(SpeciesCatalogService);

  readonly catalog = this.speciesCatalog.categories();
  readonly speciesByCategory: Record<string, SpeciesGroup[]> = {
    tropical: [
      {
        name: 'Monstera / Philodendron',
        items: [
          { label: 'Monstera deliciosa', value: 'Monstera deliciosa' },
          { label: 'Monstera adansonii', value: 'Monstera adansonii' },
          { label: 'Philodendron hederaceum (Hoja de corazón)', value: 'Philodendron hederaceum' },
          { label: "Philodendron 'Birkin'", value: "Philodendron 'Birkin'" },
          { label: 'Philodendron erubescens (Pink Princess)', value: 'Philodendron erubescens' }
        ]
      },
      {
        name: 'Pothos / Syngonium',
        items: [
          { label: 'Epipremnum aureum (Potos dorado)', value: 'Epipremnum aureum' },
          { label: "Epipremnum aureum 'Neon'", value: "Epipremnum aureum 'Neon'" },
          { label: "Epipremnum aureum 'Marble Queen'", value: "Epipremnum aureum 'Marble Queen'" },
          { label: 'Syngonium podophyllum (Singonio)', value: 'Syngonium podophyllum' }
        ]
      },
      {
        name: 'Calatheas / Marantas',
        items: [
          { label: 'Stromanthe sanguinea (Calathea Triostar)', value: 'Stromanthe sanguinea' },
          { label: 'Goeppertia orbifolia (Calathea Orbifolia)', value: 'Goeppertia orbifolia' },
          { label: 'Goeppertia veitchiana (Calathea Medallion)', value: 'Goeppertia veitchiana' },
          { label: 'Maranta leuconeura (Maranta tricolor)', value: 'Maranta leuconeura' }
        ]
      },
      {
        name: 'Alocasias / Aroides',
        items: [
          { label: 'Alocasia amazonica (Alocasia Polly)', value: 'Alocasia amazonica' },
          { label: 'Alocasia zebrina', value: 'Alocasia zebrina' },
          { label: 'Alocasia macrorrhizos (Oreja de elefante)', value: 'Alocasia macrorrhizos' }
        ]
      },
      {
        name: 'Palmas / Ficus',
        items: [
          { label: 'Dypsis lutescens (Palma Areca)', value: 'Dypsis lutescens' },
          { label: 'Howea forsteriana (Palma Kentia)', value: 'Howea forsteriana' },
          { label: 'Chamaedorea elegans (Palma de salón)', value: 'Chamaedorea elegans' },
          { label: 'Ficus elastica (Gomero)', value: 'Ficus elastica' },
          { label: 'Ficus lyrata', value: 'Ficus lyrata' },
          { label: 'Ficus benjamina', value: 'Ficus benjamina' }
        ]
      },
      {
        name: 'Otros tropicales',
        items: [
          { label: 'Spathiphyllum wallisii (Cuna de Moisés)', value: 'Spathiphyllum wallisii' },
          { label: 'Anthurium andraeanum (Anturio rojo)', value: 'Anthurium andraeanum' },
          { label: 'Asplenium nidus (Helecho nido de ave)', value: 'Asplenium nidus' },
          { label: 'Platycerium bifurcatum (Helecho cuerno de alce)', value: 'Platycerium bifurcatum' },
          { label: 'Begonia maculata', value: 'Begonia maculata' },
          { label: 'Begonia rex', value: 'Begonia rex' },
          { label: 'Aglaonema Silver Bay', value: 'Aglaonema commutatum' }
        ]
      }
    ],
    succulents: [
      {
        name: 'Aloe / Sansevieria',
        items: [
          { label: 'Aloe vera', value: 'Aloe vera' },
          { label: 'Aloe arborescens', value: 'Aloe arborescens' },
          { label: 'Dracaena trifasciata (Sansevieria)', value: 'Dracaena trifasciata' },
          { label: 'Dracaena angolensis (Sansevieria cylindrica)', value: 'Dracaena angolensis' },
          { label: "Dracaena trifasciata 'Moonshine'", value: "Dracaena trifasciata 'Moonshine'" }
        ]
      },
      {
        name: 'Crassulas / Echeverias',
        items: [
          { label: 'Crassula ovata (Árbol de jade)', value: 'Crassula ovata' },
          { label: 'Crassula marnieriana (Collar de jade)', value: 'Crassula marnieriana' },
          { label: 'Echeveria elegans', value: 'Echeveria elegans' },
          { label: 'Echeveria affinis (Black Prince)', value: 'Echeveria affinis' },
          { label: "Echeveria 'Lola'", value: "Echeveria 'Lola'" }
        ]
      },
      {
        name: 'Haworthia / Sedum',
        items: [
          { label: 'Haworthiopsis fasciata (Cebra)', value: 'Haworthiopsis fasciata' },
          { label: 'Haworthia cooperi', value: 'Haworthia cooperi' },
          { label: 'Sedum morganianum (Cola de burro)', value: 'Sedum morganianum' },
          { label: 'Sedum rubrotinctum', value: 'Sedum rubrotinctum' }
        ]
      },
      {
        name: 'Cactus y suculentas mixtas',
        items: [
          { label: 'Schlumbergera truncata (Cactus de Navidad)', value: 'Schlumbergera truncata' },
          { label: 'Epiphyllum anguliger (Cactus espina de pescado)', value: 'Epiphyllum anguliger' },
          { label: 'Opuntia microdasys', value: 'Opuntia microdasys' },
          { label: 'Euphorbia trigona', value: 'Euphorbia trigona' },
          { label: 'Senecio rowleyanus (Rosario)', value: 'Senecio rowleyanus' },
          { label: 'Echinopsis pachanoi (San Pedro)', value: 'Echinopsis pachanoi' },
          { label: 'Lithops spp.', value: 'Lithops spp.' },
          { label: 'Beaucarnea recurvata (Pata de elefante)', value: 'Beaucarnea recurvata' },
          { label: 'Yucca elephantipes', value: 'Yucca elephantipes' }
        ]
      }
    ],
    edible: [
      {
        name: 'Hortalizas y frutos',
        items: [
          { label: 'Tomate cherry', value: 'Solanum lycopersicum var. cerasiforme' },
          { label: 'Tomate Raf', value: 'Solanum lycopersicum' },
          { label: 'Pimiento morrón', value: 'Capsicum annuum' },
          { label: 'Ají / Chile', value: 'Capsicum frutescens' },
          { label: 'Pepino', value: 'Cucumis sativus' },
          { label: 'Calabacín / Zucchini', value: 'Cucurbita pepo' },
          { label: 'Berenjena', value: 'Solanum melongena' },
          { label: 'Fresa / Frutilla', value: 'Fragaria × ananassa' }
        ]
      },
      {
        name: 'Hierbas aromáticas',
        items: [
          { label: 'Albahaca genovesa', value: 'Ocimum basilicum' },
          { label: 'Menta piperita', value: 'Mentha × piperita' },
          { label: 'Hierbabuena', value: 'Mentha spicata' },
          { label: 'Romero', value: 'Salvia rosmarinus' },
          { label: 'Tomillo', value: 'Thymus vulgaris' },
          { label: 'Orégano', value: 'Origanum vulgare' },
          { label: 'Cilantro', value: 'Coriandrum sativum' },
          { label: 'Perejil', value: 'Petroselinum crispum' },
          { label: 'Cebollino', value: 'Allium schoenoprasum' },
          { label: 'Eneldo', value: 'Anethum graveolens' }
        ]
      },
      {
        name: 'Hoja verde',
        items: [
          { label: 'Lechuga romana', value: 'Lactuca sativa var. longifolia' },
          { label: 'Espinaca', value: 'Spinacia oleracea' },
          { label: 'Acelga', value: 'Beta vulgaris subsp. vulgaris' },
          { label: 'Rúcula', value: 'Eruca vesicaria' }
        ]
      },
      {
        name: 'Cítricos en maceta',
        items: [
          { label: 'Limonero en maceta', value: 'Citrus × limon' },
          { label: 'Kumquat / Naranjo chino', value: 'Citrus japonica' }
        ]
      }
    ],
    flower: [
      {
        name: 'Orquídeas y delicadas',
        items: [
          { label: 'Phalaenopsis (Orquídea)', value: 'Phalaenopsis spp.' },
          { label: 'Dendrobium (Orquídea)', value: 'Dendrobium spp.' },
          { label: 'Vanda (Orquídea)', value: 'Vanda spp.' },
          { label: 'Violeta africana', value: 'Saintpaulia ionantha' },
          { label: 'Gardenia', value: 'Gardenia jasminoides' }
        ]
      },
      {
        name: 'Ácido / sombra parcial',
        items: [
          { label: 'Azalea', value: 'Rhododendron simsii' },
          { label: 'Hortensia', value: 'Hydrangea macrophylla' },
          { label: 'Ciclamen', value: 'Cyclamen persicum' }
        ]
      },
      {
        name: 'Florales de interior',
        items: [
          { label: "Rosa miniatura", value: "Rosa chinensis 'Minima'" },
          { label: 'Geranio zonal', value: 'Pelargonium × hortorum' },
          { label: 'Begonia Elatior', value: 'Begonia × hiemalis' },
          { label: 'Amarilis', value: 'Hippeastrum spp.' },
          { label: 'Clivia', value: 'Clivia miniata' },
          { label: 'Jazmín de Madagascar', value: 'Stephanotis floribunda' },
          { label: 'Flor de Pascua / Poinsettia', value: 'Euphorbia pulcherrima' }
        ]
      }
    ],
    resilient: [
      {
        name: 'Muy resistentes',
        items: [
          { label: 'Zamioculcas zamiifolia (ZZ plant)', value: 'Zamioculcas zamiifolia' },
          { label: 'Aspidistra', value: 'Aspidistra elatior' },
          { label: 'Chlorophytum comosum (Cinta)', value: 'Chlorophytum comosum' },
          { label: 'Hedera helix (Hiedra)', value: 'Hedera helix' }
        ]
      },
      {
        name: 'Peperomias y drácenas',
        items: [
          { label: 'Peperomia obtusifolia', value: 'Peperomia obtusifolia' },
          { label: 'Peperomia caperata', value: 'Peperomia caperata' },
          { label: 'Dracaena sanderiana (Bambú de la suerte)', value: 'Dracaena sanderiana' },
          { label: 'Dracaena marginata', value: 'Dracaena marginata' },
          { label: "Dracaena fragrans 'Compacta'", value: "Dracaena fragrans 'Compacta'" },
          { label: 'Dracaena fragrans (Palo de Brasil)', value: 'Dracaena fragrans' }
        ]
      },
      {
        name: 'Trepadoras y otras',
        items: [
          { label: 'Schefflera (Árbol paraguas)', value: 'Schefflera arboricola' },
          { label: 'Tradescantia zebrina', value: 'Tradescantia zebrina' },
          { label: "Tradescantia albiflora 'Nanouk'", value: "Tradescantia albiflora 'Nanouk'" },
          { label: 'Pilea peperomioides', value: 'Pilea peperomioides' },
          { label: 'Plectranthus verticillatus (Planta del dólar)', value: 'Plectranthus verticillatus' }
        ]
      }
    ]
  };
  readonly fallbackCatalog: SpeciesCategory[] = [
    { key: 'tropical', label: '🌿 Tropical / Interior', groups: this.speciesByCategory['tropical'] },
    { key: 'succulents', label: '🌵 Árido / Suculentas', groups: this.speciesByCategory['succulents'] },
    { key: 'edible', label: '🍅 Huerto urbano', groups: this.speciesByCategory['edible'] },
    { key: 'flower', label: '🌸 Florales', groups: this.speciesByCategory['flower'] },
    { key: 'resilient', label: '🌳 Resistentes', groups: this.speciesByCategory['resilient'] }
  ];
  activeCategory = this.fallbackCatalog[0].key;
  sensorOptions: { id: string; label: string }[] = [];
  readonly mapUrl = computed(() => {
    const location = this.form.controls.location.value?.trim();
    if (!location) return null;
    const encoded = encodeURIComponent(location);
    return `https://www.openstreetmap.org/export/embed.html?search=${encoded}&layer=mapnik`;
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    species: ['', Validators.required],
    location: [''],
    sensorId: ['']
  });

  constructor() {
    this.loadSensors();
  }

  get categories() {
    const api = this.catalog();
    return api.length ? api : this.fallbackCatalog;
  }

  get groups(): SpeciesGroup[] {
    const api = this.catalog();
    if (api.length) {
      const current = api.find((c) => c.key === this.activeCategory) ?? api[0];
      return current?.groups ?? [];
    }
    return this.speciesByCategory[this.activeCategory] ?? this.fallbackCatalog[0].groups;
  }

  setCategory(key: string) {
    this.activeCategory = key;
    this.form.controls.species.setValue('');
  }

  save() {
    if (this.form.invalid) {
      return;
    }
    const { name, species, location, sensorId } = this.form.getRawValue();
    this.plantFacade
      .createPlant({
        name,
        species,
        location: location || undefined,
        sensorId: sensorId || undefined
      })
      .subscribe({
        next: () => {
          this.form.reset({ name: '', species: '', location: '', sensorId: '' });
          this.router.navigate(['/plants']);
        }
      });
  }

  refreshMap() {
    const current = this.form.controls.location.value;
    this.form.controls.location.setValue(current ?? '', { emitEvent: false });
  }

  private loadSensors() {
    this.sensorRepository.search({ page: 0, size: 50 }).subscribe({
      next: (result) =>
      (this.sensorOptions = result.content.map((sensor) => ({
        id: sensor.id,
        label: `${sensor.id} · ${sensor.type ?? 'Sensor'}`
      }))),
      error: () => (this.sensorOptions = [])
    });
  }
}
