import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { TravelPackage } from '../../../core/models/travel-package';
import { Destination } from '../../../core/models/destination';
import { CategoryPackage } from '../../../core/models/category-package';
import {
  PackageCreatePayload,
  Packages,
  PackageUpdatePayload,
} from '../../../core/services/packages';
import { Destinations } from '../../../core/services/destinations';
import { CategoryPackages } from '../../../core/services/category-packages';

type PackageFormModel = {
  title: string;
  description: string;
  price: number | null;
  startDate: string;
  endDate: string;
  maxSlots: number | null;
  imageUrl: string;
  categoryPackageId: string;
  destinationId: string;
};

@Component({
  selector: 'app-admin-packages',
  standalone: true,
  imports: [
    Header,
    Footer,
    RouterLink,
    PackagePagination,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './admin-packages.html',
  styleUrl: './admin-packages.css',
})
export class AdminPackages {
  private packagesService = inject(Packages);
  private destinationsService = inject(Destinations);
  private categoryPackagesService = inject(CategoryPackages);

  packages = signal<TravelPackage[]>([]);
  destinationOptions = signal<Destination[]>([]);
  categoryOptions = signal<CategoryPackage[]>([]);

  editingPackage = signal<TravelPackage | null>(null);

  packageForm = signal<PackageFormModel>({
    title: '',
    description: '',
    price: null,
    startDate: '',
    endDate: '',
    maxSlots: null,
    imageUrl: '',
    categoryPackageId: '',
    destinationId: '',
  });

  isEditing = computed(() => this.editingPackage() !== null);

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(5);

  ngOnInit(): void {
    this.loadPackages();
    this.loadDestinations();
    this.loadCategories();
  }

  loadPackages(): void {
    this.packagesService.getAll(1, 50).subscribe({
      next: (response) => {
        this.packages.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  loadDestinations(): void {
    this.destinationsService.getAll(1, 50).subscribe({
      next: (response) => {
        this.destinationOptions.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  loadCategories(): void {
    this.categoryPackagesService.getAll(1, 50).subscribe({
      next: (response) => {
        this.categoryOptions.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  filteredPackages = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.packages().filter(pack =>
      pack.title.toLowerCase().includes(term) ||
      pack.description.toLowerCase().includes(term) ||
      pack.destination.name.toLowerCase().includes(term) ||
      pack.categoryPackage.name.toLowerCase().includes(term)
    );
  });

  packagesResponse = computed(() => {
    const filtered = this.filteredPackages();

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
    this.editingPackage.set(null);

    this.packageForm.set({
      title: '',
      description: '',
      price: null,
      startDate: '',
      endDate: '',
      maxSlots: null,
      imageUrl: '',
      categoryPackageId: '',
      destinationId: '',
    });
  }

  openEditModal(pack: TravelPackage): void {
    this.editingPackage.set(pack);

    this.packageForm.set({
      title: pack.title,
      description: pack.description,
      price: pack.price,
      startDate: this.toInputDate(pack.startDate),
      endDate: this.toInputDate(pack.endDate),
      maxSlots: pack.maxSlots,
      imageUrl: pack.imageUrl,
      categoryPackageId: pack.categoryPackage.id,
      destinationId: pack.destination.id,
    });
  }

  updateFormField(field: keyof PackageFormModel, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

    this.packageForm.update(current => ({
      ...current,
      [field]: this.normalizeFieldValue(field, value),
    }));
  }

  savePackage(): void {
    const form = this.packageForm();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.price ||
      !form.maxSlots ||
      !form.imageUrl.trim() ||
      !form.categoryPackageId ||
      !form.destinationId
    ) {
      return;
    }

    const editing = this.editingPackage();

    if (editing) {
      const payload: PackageUpdatePayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price,
        startDate: this.toApiDate(form.startDate),
        endDate: this.toApiDate(form.endDate),
        maxSlots: form.maxSlots,
        imageUrl: form.imageUrl.trim(),
      };

      this.packagesService.update(editing.id, payload).subscribe({
        next: () => {
          this.loadPackages();
        },
        error: (error) => {
          console.error(error);
        },
      });

      return;
    }

    const payload: PackageCreatePayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price,
      startDate: this.toApiDate(form.startDate),
      endDate: this.toApiDate(form.endDate),
      maxSlots: form.maxSlots,
      imageUrl: form.imageUrl.trim(),
      categoryPackageId: form.categoryPackageId,
      destinationId: form.destinationId,
    };

    this.packagesService.create(payload).subscribe({
      next: () => {
        this.currentPage.set(1);
        this.loadPackages();

        this.packageForm.set({
          title: '',
          description: '',
          price: null,
          startDate: '',
          endDate: '',
          maxSlots: null,
          imageUrl: '',
          categoryPackageId: '',
          destinationId: '',
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  togglePackageStatus(pack: TravelPackage): void {
    this.packagesService.update(pack.id, {
      isActive: !pack.isActive,
    }).subscribe({
      next: () => {
        this.loadPackages();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deletePackage(pack: TravelPackage): void {
    const confirmed = confirm(`¿Seguro que querés eliminar el paquete ${pack.title}?`);

    if (!confirmed) {
      return;
    }

    this.packagesService.delete(pack.id).subscribe({
      next: () => {
        this.loadPackages();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  private normalizeFieldValue(field: keyof PackageFormModel, value: string): string | number | null {
    if (field === 'price' || field === 'maxSlots') {
      return value === '' ? null : Number(value);
    }

    return value;
  }

  private toInputDate(value: string | null): string {
    if (!value) return '';

    return value.slice(0, 10);
  }

  private toApiDate(value: string): string | null {
    if (!value) return null;

    return new Date(`${value}T00:00:00`).toISOString();
  }
}
