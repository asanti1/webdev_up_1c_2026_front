import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';

interface CountryOption {
  id: string;
  name: string;
}

interface DestinationMock {
  id: string;
  name: string;
  description: string;
  country: CountryOption;
}

type DestinationFormModel = {
  name: string;
  description: string;
  countryId: string;
};

@Component({
  selector: 'app-admin-destinations',
  standalone: true,
  imports: [
    Header,
    Footer,
    RouterLink,
    PackagePagination,
  ],
  templateUrl: './admin-destinations.html',
  styleUrl: './admin-destinations.css',
})
export class AdminDestinations {
  countryOptions: CountryOption[] = [
    { id: '1', name: 'Argentina' },
    { id: '2', name: 'Brasil' },
    { id: '3', name: 'Chile' },
    { id: '4', name: 'Uruguay' },
  ];

  destinations = signal<DestinationMock[]>([
    {
      id: '1',
      name: 'Bariloche',
      description: 'Destino patagónico con montañas, lagos y actividades al aire libre.',
      country: { id: '1', name: 'Argentina' },
    },
    {
      id: '2',
      name: 'Mendoza',
      description: 'Destino reconocido por bodegas, gastronomía y paisajes cordilleranos.',
      country: { id: '1', name: 'Argentina' },
    },
    {
      id: '3',
      name: 'Río de Janeiro',
      description: 'Ciudad costera con playas, cultura urbana y atractivos turísticos.',
      country: { id: '2', name: 'Brasil' },
    },
    {
      id: '4',
      name: 'Santiago',
      description: 'Capital chilena con oferta cultural, gastronómica y cercanía a la cordillera.',
      country: { id: '3', name: 'Chile' },
    },
  ]);

  editingDestination = signal<DestinationMock | null>(null);

  destinationForm = signal<DestinationFormModel>({
    name: '',
    description: '',
    countryId: '',
  });

  isEditing = computed(() => this.editingDestination() !== null);

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(5);

  filteredDestinations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.destinations().filter(destination =>
      destination.name.toLowerCase().includes(term) ||
      destination.description.toLowerCase().includes(term) ||
      destination.country.name.toLowerCase().includes(term)
    );
  });

  destinationsResponse = computed(() => {
    const filtered = this.filteredDestinations();

    const page = this.currentPage();
    const limit = this.pageSize();
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);

    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      total,
      page,
      limit,
      totalPages,
    };
  });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  openCreateModal(): void {
    this.editingDestination.set(null);

    this.destinationForm.set({
      name: '',
      description: '',
      countryId: '',
    });
  }

  openEditModal(destination: DestinationMock): void {
    this.editingDestination.set(destination);

    this.destinationForm.set({
      name: destination.name,
      description: destination.description,
      countryId: destination.country.id,
    });
  }

  updateFormField(field: keyof DestinationFormModel, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

    this.destinationForm.update(current => ({
      ...current,
      [field]: value,
    }));
  }

  saveDestination(): void {
    const form = this.destinationForm();

    if (!form.name.trim() || !form.description.trim() || !form.countryId) {
      return;
    }

    const country = this.countryOptions.find(item => item.id === form.countryId);

    if (!country) {
      return;
    }

    const editing = this.editingDestination();

    /*
      Después:
      if (editing) {
        destinationService.update(editing.id, form)
      } else {
        destinationService.create(form)
      }
    */

    if (editing) {
      this.destinations.update(current =>
        current.map(destination =>
          destination.id === editing.id
            ? {
                ...destination,
                name: form.name.trim(),
                description: form.description.trim(),
                country,
              }
            : destination
        )
      );

      return;
    }

    const newDestination: DestinationMock = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description.trim(),
      country,
    };

    this.destinations.update(current => [
      newDestination,
      ...current,
    ]);

    this.currentPage.set(1);
  }

  deleteDestination(destination: DestinationMock): void {
    const confirmed = confirm(`¿Seguro que querés eliminar ${destination.name}?`);

    if (!confirmed) {
      return;
    }

    this.destinations.update(current =>
      current.filter(item => item.id !== destination.id)
    );
  }
}
