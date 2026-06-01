import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '../../core/auth/auth-state';
import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { CategorySidebar } from "./category-sidebar/category-sidebar";
import { PackageCard } from "./package-card/package-card";
import { PackagePagination } from "./package-pagination/package-pagination";
import { Packages } from '../../core/services/packages';
import { TravelPackage } from '../../core/models/travel-package';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-home',
  imports: [Header, Footer, CategorySidebar, PackageCard, PackagePagination],
  templateUrl: './home.html',
  styleUrl: './home.css',
  standalone: true
})
export class Home {
  private authState = inject(AuthState);
  private router = inject(Router);
  private packagesService = inject(Packages);
  searchTerm = signal('');
  selectedCategory = signal('Todas');
  currentPage = signal(1);
  pageSize = signal(3);
  packages = signal<TravelPackage[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

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

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.loading.set(true);
    this.error.set(null);

    this.packagesService.getAll(1, 50).subscribe({
      next: (response) => {
        this.packages.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los paquetes');
        this.loading.set(false);
      },
    });
  }

  filteredPackages = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory().toLowerCase();

    return this.packages().filter(pack => {
      const matchesSearch =
        pack.title.toLowerCase().includes(term) ||
        pack.destination.name.toLowerCase().includes(term) ||
        pack.categoryPackage.name.toLowerCase().includes(term);

      const matchesCategory =
        category === 'todas' ||
        pack.categoryPackage.name.toLowerCase() === category;

      return matchesSearch && matchesCategory;
    });
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  logout(): void {
    this.authState.clearSession();
    this.router.navigateByUrl('/login');
  }
}
