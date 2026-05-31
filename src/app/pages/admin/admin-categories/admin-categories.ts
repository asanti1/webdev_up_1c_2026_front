import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';

interface CategoryMock {
  id: string;
  name: string;
  description: string;
}

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
  categories = signal<CategoryMock[]>([
    {
      id: '1',
      name: 'Aventura',
      description: 'Paquetes orientados a actividades al aire libre.',
    },
    {
      id: '2',
      name: 'Relax',
      description: 'Viajes de descanso, spa y desconexión.',
    },
    {
      id: '3',
      name: 'Cultural',
      description: 'Experiencias históricas, gastronómicas y urbanas.',
    },
    {
      id: '4',
      name: 'Naturaleza',
      description: 'Destinos con paisajes naturales y excursiones.',
    },
  ]);

  editingCategory = signal<CategoryMock | null>(null);

  categoryForm = signal<CategoryFormModel>({
    name: '',
    description: '',
  });

  isEditing = computed(() => this.editingCategory() !== null);

  searchTerm = signal('');
  currentPage = signal(1);
  pageSize = signal(5);

  filteredCategories = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.categories().filter(category =>
      category.name.toLowerCase().includes(term) ||
      category.description.toLowerCase().includes(term)
    );
  });

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

  openEditModal(category: CategoryMock): void {
    this.editingCategory.set(category);

    this.categoryForm.set({
      name: category.name,
      description: category.description,
    });
  }

  updateFormField(field: keyof CategoryFormModel, event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.categoryForm.update(current => ({
      ...current,
      [field]: value,
    }));
  }

  saveCategory(): void {
    const form = this.categoryForm();

    if (!form.name.trim() || !form.description.trim()) {
      return;
    }

    const editing = this.editingCategory();

    /*
      Después:
      if (editing) {
        categoryService.update(editing.id, form)
      } else {
        categoryService.create(form)
      }
    */

    if (editing) {
      this.categories.update(current =>
        current.map(category =>
          category.id === editing.id
            ? {
                ...category,
                name: form.name.trim(),
                description: form.description.trim(),
              }
            : category
        )
      );

      return;
    }

    const newCategory: CategoryMock = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description.trim(),
    };

    this.categories.update(current => [
      newCategory,
      ...current,
    ]);

    this.currentPage.set(1);
  }

  deleteCategory(category: CategoryMock): void {
    const confirmed = confirm(`¿Seguro que querés eliminar ${category.name}?`);

    if (!confirmed) {
      return;
    }

    this.categories.update(current =>
      current.filter(item => item.id !== category.id)
    );
  }
}
