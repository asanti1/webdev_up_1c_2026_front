import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';

interface Option {
  id: string;
  name: string;
}

interface PackageMock {
  id: string;
  title: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  availableSlots: number;
  maxSlots: number;
  isActive: boolean;
  imageUrl: string;
  categoryPackage: Option;
  destination: Option;
}

type PackageFormModel = {
  title: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  maxSlots: number;
  imageUrl: string;
  categoryPackageId: string;
  destinationId: string;
};

@Component({
  selector: 'app-admin-packages',
  standalone: true,
  imports: [Header, Footer, RouterLink, PackagePagination, CurrencyPipe, DatePipe],
  templateUrl: './admin-packages.html',
  styleUrl: './admin-packages.css',
})
export class AdminPackages {
  categoryOptions: Option[] = [
    { id: '1', name: 'Aventura' },
    { id: '2', name: 'Relax' },
    { id: '3', name: 'Cultural' },
    { id: '4', name: 'Naturaleza' },
  ];

  destinationOptions: Option[] = [
    { id: '1', name: 'Bariloche' },
    { id: '2', name: 'Mendoza' },
    { id: '3', name: 'Río de Janeiro' },
    { id: '4', name: 'Santiago' },
  ];

  packages = signal<PackageMock[]>([
    {
      id: '1',
      title: 'Bariloche Aventura',
      description: 'Paquete de aventura en la Patagonia.',
      price: 850000,
      startDate: '2026-07-10',
      endDate: '2026-07-17',
      availableSlots: 18,
      maxSlots: 25,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849',
      categoryPackage: { id: '1', name: 'Aventura' },
      destination: { id: '1', name: 'Bariloche' },
    },
    {
      id: '2',
      title: 'Mendoza Relax',
      description: 'Viaje de descanso, bodegas y cordillera.',
      price: 620000,
      startDate: '2026-08-05',
      endDate: '2026-08-10',
      availableSlots: 10,
      maxSlots: 20,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1586359375748-338d21b5b592',
      categoryPackage: { id: '2', name: 'Relax' },
      destination: { id: '2', name: 'Mendoza' },
    },
  ]);

  editingPackage = signal<PackageMock | null>(null);

  packageForm = signal<PackageFormModel>({
    title: '',
    description: '',
    price: 0,
    startDate: '',
    endDate: '',
    maxSlots: 1,
    imageUrl: '',
    categoryPackageId: '',
    destinationId: '',
  });

  isEditing = computed(() => this.editingPackage() !== null);

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(5);

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
      price: 0,
      startDate: '',
      endDate: '',
      maxSlots: 1,
      imageUrl: '',
      categoryPackageId: '',
      destinationId: '',
    });
  }

  openEditModal(pack: PackageMock): void {
    this.editingPackage.set(pack);

    this.packageForm.set({
      title: pack.title,
      description: pack.description,
      price: pack.price,
      startDate: pack.startDate,
      endDate: pack.endDate,
      maxSlots: pack.maxSlots,
      imageUrl: pack.imageUrl,
      categoryPackageId: pack.categoryPackage.id,
      destinationId: pack.destination.id,
    });
  }

  updateFormField(field: keyof PackageFormModel, event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    const value =
      field === 'price' || field === 'maxSlots'
        ? Number(input.value)
        : input.value;

    this.packageForm.update(current => ({
      ...current,
      [field]: value,
    }));
  }

  savePackage(): void {
    const form = this.packageForm();

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.categoryPackageId ||
      !form.destinationId ||
      form.price <= 0 ||
      form.maxSlots <= 0
    ) {
      return;
    }

    const categoryPackage = this.categoryOptions.find(item => item.id === form.categoryPackageId);
    const destination = this.destinationOptions.find(item => item.id === form.destinationId);

    if (!categoryPackage || !destination) {
      return;
    }

    const editing = this.editingPackage();

    if (editing) {
      this.packages.update(current =>
        current.map(pack =>
          pack.id === editing.id
            ? {
                ...pack,
                title: form.title.trim(),
                description: form.description.trim(),
                price: form.price,
                startDate: form.startDate,
                endDate: form.endDate,
                maxSlots: form.maxSlots,
                imageUrl: form.imageUrl.trim(),
                categoryPackage,
                destination,
              }
            : pack
        )
      );

      return;
    }

    const newPackage: PackageMock = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price,
      startDate: form.startDate,
      endDate: form.endDate,
      availableSlots: form.maxSlots,
      maxSlots: form.maxSlots,
      isActive: true,
      imageUrl: form.imageUrl.trim(),
      categoryPackage,
      destination,
    };

    this.packages.update(current => [newPackage, ...current]);
    this.currentPage.set(1);
  }

  togglePackageStatus(pack: PackageMock): void {
    this.packages.update(current =>
      current.map(item =>
        item.id === pack.id
          ? { ...item, isActive: !item.isActive }
          : item
      )
    );
  }

  deletePackage(pack: PackageMock): void {
    const confirmed = confirm(`¿Seguro que querés eliminar ${pack.title}?`);

    if (!confirmed) return;

    this.packages.update(current =>
      current.filter(item => item.id !== pack.id)
    );
  }
}
