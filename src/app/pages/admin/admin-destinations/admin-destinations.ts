import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { Destination } from '../../../core/models/destination';
import { Country } from '../../../core/models/country';
import {
  DestinationPayload,
  Destinations,
} from '../../../core/services/destinations';
import { Countries } from '../../../core/services/countries';
import { paginate } from '../../../core/utils/paginate';
import { API_LIST_LIMIT, DEFAULT_ADMIN_PAGE_SIZE } from '../../../core/constants/pagination';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminSearchInput } from "../admin-search-input/admin-search-input";

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
    PackagePagination,
    AdminPageHeader,
    AdminEmptyState,
    AdminSearchInput
],
  templateUrl: './admin-destinations.html',
})
export class AdminDestinations {
  private destinationsService = inject(Destinations);
  private countriesService = inject(Countries);

  destinations = signal<Destination[]>([]);
  countryOptions = signal<Country[]>([]);

  editingDestination = signal<Destination | null>(null);

  destinationForm = signal<DestinationFormModel>({
    name: '',
    description: '',
    countryId: '',
  });

  isEditing = computed(() => this.editingDestination() !== null);

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(DEFAULT_ADMIN_PAGE_SIZE);

  ngOnInit(): void {
    this.loadDestinations();
    this.loadCountries();
  }

  loadDestinations(): void {
    this.destinationsService.getAll(1, API_LIST_LIMIT).subscribe({
      next: (response) => {
        this.destinations.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  loadCountries(): void {
    this.countriesService.getAll(1, API_LIST_LIMIT).subscribe({
      next: (response) => {
        this.countryOptions.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  filteredDestinations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.destinations().filter(destination =>
      destination.name.toLowerCase().includes(term) ||
      destination.description.toLowerCase().includes(term) ||
      destination.country.name.toLowerCase().includes(term)
    );
  });

  destinationsResponse = computed(() =>
    paginate(
      this.filteredDestinations(),
      this.currentPage(),
      this.pageSize(),
    )
  );

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

  openEditModal(destination: Destination): void {
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

    const payload: DestinationPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      countryId: form.countryId,
    };

    if (!payload.name || !payload.description || !payload.countryId) return;

    const editing = this.editingDestination();

    if (editing) {
      this.destinationsService.update(editing.id, payload).subscribe({
        next: () => {
          this.loadDestinations();
        },
        error: (error) => { console.error(error) },
      });

      return;
    }

    this.destinationsService.create(payload).subscribe({
      next: () => {
        this.currentPage.set(1);
        this.loadDestinations();

        this.destinationForm.set({
          name: '',
          description: '',
          countryId: '',
        });
      },
      error: (error) => { console.error(error) },
    });
  }

  deleteDestination(destination: Destination): void {
    const confirmed = confirm(`¿Seguro que querés eliminar el destino ${destination.name}?`);

    if (!confirmed) return;

    this.destinationsService.delete(destination.id).subscribe({
      next: () => {
        this.loadDestinations();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
