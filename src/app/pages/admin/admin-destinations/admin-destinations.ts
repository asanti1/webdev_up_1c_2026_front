import { Component, computed, inject, signal } from '@angular/core';
import { API_LIST_LIMIT, DEFAULT_ADMIN_PAGE_SIZE } from '../../../core/constants/pagination';
import { Country } from '../../../core/models/country';
import { Destination } from '../../../core/models/destination';
import { PaginatedResponse } from '../../../core/models/paginated-response';
import { Countries } from '../../../core/services/countries';
import { DestinationPayload, Destinations } from '../../../core/services/destinations';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';

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
  ],
  templateUrl: './admin-destinations.html',
})
export class AdminDestinations {
  private destinationsService = inject(Destinations);
  private countriesService = inject(Countries);

  countryOptions = signal<Country[]>([]);
  editingDestination = signal<Destination | null>(null);

  destinationForm = signal<DestinationFormModel>({
    name: '',
    description: '',
    countryId: '',
  });

  destinationsResponse = signal<PaginatedResponse<Destination>>({
    data: [],
    total: 0,
    page: 1,
    limit: DEFAULT_ADMIN_PAGE_SIZE,
    totalPages: 0,
  });

  isEditing = computed(() => this.editingDestination() !== null);
  currentPage = signal(1);

  ngOnInit(): void {
    this.loadDestinations();
    this.loadCountries();
  }

  loadDestinations(page = 1): void {
    this.destinationsService.getAll(page, DEFAULT_ADMIN_PAGE_SIZE).subscribe({
      next: (response) => {
        this.destinationsResponse.set(response);
        this.currentPage.set(response.page);
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

  goToPage(page: number): void {
    this.loadDestinations(page);
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
    const value = (
      event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ).value;

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

    if (!payload.name || !payload.description || !payload.countryId) {
      return;
    }

    const editing = this.editingDestination();

    if (editing) {
      this.destinationsService.update(editing.id, payload).subscribe({
        next: () => {
          this.loadDestinations(this.currentPage());
        },
        error: (error) => {
          console.error(error);
        },
      });

      return;
    }

    this.destinationsService.create(payload).subscribe({
      next: () => {
        this.currentPage.set(1);
        this.loadDestinations(1);

        this.destinationForm.set({
          name: '',
          description: '',
          countryId: '',
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteDestination(destination: Destination): void {
    const confirmed = confirm(
      `¿Seguro que querés eliminar el destino ${destination.name}?`
    );

    if (!confirmed) return;

    this.destinationsService.delete(destination.id).subscribe({
      next: () => {
        this.loadDestinations(this.currentPage());
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
