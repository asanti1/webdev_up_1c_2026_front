import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { Countries } from '../../../core/services/countries';
import { Country } from '../../../core/models/country';

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
    RouterLink,
    PackagePagination,
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
  pageSize = signal(5);

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.countriesService.getAll(1, 50).subscribe({
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

  countriesResponse = computed(() => {
    const filtered = this.filteredCountries();

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
