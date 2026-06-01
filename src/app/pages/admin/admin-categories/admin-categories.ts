import { Component, computed, inject, signal } from '@angular/core';
import { DEFAULT_ADMIN_PAGE_SIZE } from '../../../core/constants/pagination';
import { CategoryPackage } from '../../../core/models/category-package';
import { PaginatedResponse } from '../../../core/models/paginated-response';
import {
  CategoryPackagePayload,
  CategoryPackages,
} from '../../../core/services/category-packages';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';

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
    PackagePagination,
    AdminPageHeader,
    AdminEmptyState,
  ],
  templateUrl: './admin-categories.html',
})
export class AdminCategories {
  private categoryPackagesService = inject(CategoryPackages);

  editingCategory = signal<CategoryPackage | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  categoryForm = signal<CategoryFormModel>({
    name: '',
    description: '',
  });

  categoriesResponse = signal<PaginatedResponse<CategoryPackage>>({
    data: [],
    total: 0,
    page: 1,
    limit: DEFAULT_ADMIN_PAGE_SIZE,
    totalPages: 0,
  });

  currentPage = signal(1);

  isEditing = computed(() => this.editingCategory() !== null);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(page = 1): void {
    this.categoryPackagesService
      .getAll(page, DEFAULT_ADMIN_PAGE_SIZE)
      .subscribe({
        next: (response) => {
          this.categoriesResponse.set(response);
          this.currentPage.set(response.page);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  goToPage(page: number): void {
    this.loadCategories(page);
  }

  openCreateModal(): void {
    this.editingCategory.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.categoryForm.set({
      name: '',
      description: '',
    });
  }

  openEditModal(category: CategoryPackage): void {
    this.editingCategory.set(category);
    this.errorMessage.set(null);
    this.successMessage.set(null);

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
          this.successMessage.set('Categoría actualizada correctamente');
          this.loadCategories(this.currentPage());
        },
        error: (error) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });

      return;
    }

    this.categoryPackagesService.create(payload).subscribe({
      next: () => {
        this.successMessage.set('Categoría creada correctamente');
        this.currentPage.set(1);
        this.loadCategories(1);

        this.categoryForm.set({
          name: '',
          description: '',
        });
      },
      error: (error) => {
        this.errorMessage.set(this.getErrorMessage(error));
      },
    });
  }

  deleteCategory(category: CategoryPackage): void {
    const confirmed = confirm(
      `¿Seguro que querés eliminar la categoría ${category.name}?`
    );

    if (!confirmed) return;

    this.categoryPackagesService.delete(category.id).subscribe({
      next: () => {
        this.loadCategories(this.currentPage());
      },
      error: (error) => {
        this.errorMessage.set(this.getErrorMessage(error));
      },
    });
  }

  private getErrorMessage(error: any): string {
    return (
      error?.error?.error?.message ||
      error?.error?.message ||
      'Ocurrió un error inesperado'
    );
  }
}
