import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { CategoryPackage } from '../../../core/models/category-package';
import {
  CategoryPackagePayload,
  CategoryPackages,
} from '../../../core/services/category-packages';

type CategoryFormModel = {
  name: string;
  description: string;
};

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    Header,
    Footer,
    RouterLink,
    PackagePagination,
  ],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
})
export class AdminCategories {
  private categoryPackagesService = inject(CategoryPackages);

  categories = signal<CategoryPackage[]>([]);
  editingCategory = signal<CategoryPackage | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  categoryForm = signal<CategoryFormModel>({
    name: '',
    description: '',
  });

  isEditing = computed(() => this.editingCategory() !== null);

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(5);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryPackagesService.getAll(1, 50).subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  filteredCategories = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.categories().filter(category =>
      category.name.toLowerCase().includes(term) ||
      category.description.toLowerCase().includes(term)
    );
  });
  private getErrorMessage(error: any): string {
    return (
      error?.error?.error?.message ||
      error?.error?.message ||
      'Ocurrió un error inesperado'
    );
  }
  categoriesResponse = computed(() => {
    const filtered = this.filteredCategories();

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
    this.editingCategory.set(null);

    this.categoryForm.set({
      name: '',
      description: '',
    });
  }

  openEditModal(category: CategoryPackage): void {
    this.editingCategory.set(category);

    this.categoryForm.set({
      name: category.name,
      description: category.description,
    });
  }

  updateFormField(field: keyof CategoryFormModel, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;

    this.categoryForm.update(current => ({
      ...current,
      [field]: value,
    }));
  }

  saveCategory(): void {
    const form = this.categoryForm();

    const payload: CategoryPackagePayload = {
      name: form.name.trim(),
      description: form.description.trim(),
    };

    if (!payload.name || !payload.description) {
      return;
    }

    const editing = this.editingCategory();

    if (editing) {
      this.categoryPackagesService.update(editing.id, payload).subscribe({
        next: () => {
          this.successMessage.set(
            'Categoría actualizada correctamente'
          );

          this.loadCategories();

        },
        error: (error) => {
          console.error(error);
        },
      });

      return;
    }

    this.categoryPackagesService.create(payload).subscribe({
      next: () => {
        this.successMessage.set(
          'Categoría creada correctamente'
        );
        this.currentPage.set(1);
        this.loadCategories();

        this.categoryForm.set({
          name: '',
          description: '',
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteCategory(category: CategoryPackage): void {
    const confirmed = confirm(`¿Seguro que querés eliminar la categoría ${category.name}?`);

    if (!confirmed) {
      return;
    }

    this.categoryPackagesService.delete(category.id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (error) => {
        this.errorMessage.set(
          this.getErrorMessage(error)
        );
      },
    });
  }
}
