import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';

interface CountryMock {
  id: string;
  name: string;
  isoCode: string;
}

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
  countries = signal<CountryMock[]>([
    { id: '1', name: 'Argentina', isoCode: 'ARG' },
    { id: '2', name: 'Brasil', isoCode: 'BRA' },
    { id: '3', name: 'Chile', isoCode: 'CHL' },
    { id: '4', name: 'Uruguay', isoCode: 'URY' },
    { id: '5', name: 'Perú', isoCode: 'PER' },
    { id: '6', name: 'México', isoCode: 'MEX' },
    { id: '7', name: 'España', isoCode: 'ESP' },
  ]);


  editingCountry = signal<CountryMock | null>(null);

  countryForm = signal<CountryFormModel>({
    name: '',
    isoCode: '',
  });

  isEditing = computed(() => this.editingCountry() !== null);

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(5);

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

  createCountry(): void {
    console.log('Crear país');
  }

  editCountry(country: CountryMock): void {
    console.log('Editar país', country);
  }

  deleteCountry(country: CountryMock): void {
    const confirmed = confirm(`¿Seguro que querés eliminar ${country.name}?`);

    if (!confirmed) {
      return;
    }

    this.countries.update(current =>
      current.filter(item => item.id !== country.id)
    );
  }
  openCreateModal(): void {
    this.editingCountry.set(null);

    this.countryForm.set({
      name: '',
      isoCode: '',
    });
  }

  openEditModal(country: CountryMock): void {
    this.editingCountry.set(country);

    this.countryForm.set({
      name: country.name,
      isoCode: country.isoCode,
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

    if (!form.name.trim() || !form.isoCode.trim()) {
      return;
    }

    const editing = this.editingCountry();
    /*if (editing) {
      countriesService.update(editing.id, form)
    } else {
      countriesService.create(form)
    }*/
    if (editing) {
      this.countries.update(current =>
        current.map(country =>
          country.id === editing.id
            ? {
              ...country,
              name: form.name.trim(),
              isoCode: form.isoCode.trim().toUpperCase(),
            }
            : country
        )
      );

      return;
    }

    const newCountry: CountryMock = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      isoCode: form.isoCode.trim().toUpperCase(),
    };

    this.countries.update(current => [
      newCountry,
      ...current,
    ]);

    this.currentPage.set(1);
  }
}
