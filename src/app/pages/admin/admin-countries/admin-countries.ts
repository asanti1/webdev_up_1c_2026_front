import { Component, inject, signal } from '@angular/core';
import { DEFAULT_ADMIN_PAGE_SIZE } from '../../../core/constants/pagination';
import { Country } from '../../../core/models/country';
import { PaginatedResponse } from '../../../core/models/paginated-response';
import { Countries } from '../../../core/services/countries';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';

type CountryFormModel = {
  name: string;
  isoCode: string;
};

@Component({
  selector: 'app-admin-countries',
  standalone: true,
  imports: [
    Header,
    Footer,
    PackagePagination,
    AdminPageHeader,
    AdminEmptyState,
  ],
  templateUrl: './admin-countries.html',
})
export class AdminCountries {
  private countriesService = inject(Countries);

  countryForm = signal<CountryFormModel>({
    name: '',
    isoCode: '',
  });

  countriesResponse = signal<PaginatedResponse<Country>>({
    data: [],
    total: 0,
    page: 1,
    limit: DEFAULT_ADMIN_PAGE_SIZE,
    totalPages: 0,
  });

  currentPage = signal(1);

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(page = 1): void {
    this.countriesService.getAll(page, DEFAULT_ADMIN_PAGE_SIZE).subscribe({
      next: (response) => {
        this.countriesResponse.set(response);
        this.currentPage.set(response.page);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  goToPage(page: number): void {
    this.loadCountries(page);
  }

  openCreateModal(): void {
    this.countryForm.set({
      name: '',
      isoCode: '',
    });
  }

  updateFormField(field: keyof CountryFormModel, event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.countryForm.update(current => ({
      ...current,
      [field]: value,
    }));
  }

  saveCountry(): void {
    const form = this.countryForm();

    const payload = {
      name: form.name.trim(),
      isoCode: form.isoCode.trim().toUpperCase(),
    };

    if (!payload.name || !payload.isoCode) {
      return;
    }

    this.countriesService.create(payload).subscribe({
      next: () => {
        this.currentPage.set(1);
        this.loadCountries(1);

        this.countryForm.set({
          name: '',
          isoCode: '',
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
