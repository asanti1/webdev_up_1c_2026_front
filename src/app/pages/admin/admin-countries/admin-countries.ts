import { Component, computed, inject, signal } from '@angular/core';
import { API_LIST_LIMIT, DEFAULT_ADMIN_PAGE_SIZE } from '../../../core/constants/pagination';
import { Country } from '../../../core/models/country';
import { Countries } from '../../../core/services/countries';
import { paginate } from '../../../core/utils/paginate';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminSearchInput } from '../admin-search-input/admin-search-input';

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
    AdminSearchInput
  ],
  templateUrl: './admin-countries.html',
  styleUrl: './admin-countries.css',
})
export class AdminCountries {
  private countriesService = inject(Countries);
  countries = signal<Country[]>([]);

  countryForm = signal<CountryFormModel>({
    name: '',
    isoCode: '',
  });

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(DEFAULT_ADMIN_PAGE_SIZE);

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.countriesService.getAll(1, API_LIST_LIMIT).subscribe({
      next: (response) => {
        this.countries.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  filteredCountries = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.countries().filter(country =>
      country.name.toLowerCase().includes(term) ||
      country.isoCode.toLowerCase().includes(term)
    );
  });

  countriesResponse = computed(() =>
    paginate(
      this.filteredCountries(),
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
        this.loadCountries();

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
