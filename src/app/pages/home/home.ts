import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '../../core/auth/auth-state';
import { Footer } from "../footer/footer";
import { Header } from "../header/header";
import { CategorySidebar } from "./category-sidebar/category-sidebar";
import { PackageCard } from "./package-card/package-card";
import { PackagePagination } from "./package-pagination/package-pagination";

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

  packages = [
    {
      id: '1',
      title: 'Bariloche Aventura',
      destination: 'Bariloche',
      category: 'Aventura',
      price: 850000,
      imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849',
      availableSlots: 18,
    },
    {
      id: '2',
      title: 'Mendoza Relax',
      destination: 'Mendoza',
      category: 'Relax',
      price: 620000,
      imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3',
      availableSlots: 10,
    },
    {
      id: '3',
      title: 'Ushuaia Fin del Mundo',
      destination: 'Ushuaia',
      category: 'Naturaleza',
      price: 980000,
      imageUrl: 'https://images.unsplash.com/photo-1535837487710-a191373a20ae',
      availableSlots: 7,
    },
    {
      id: '4',
      title: 'Salta Cultural',
      destination: 'Salta',
      category: 'Cultural',
      price: 540000,
      imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3',
      availableSlots: 14,
    },
  ];

  searchTerm = signal('');
  selectedCategory = signal('Todas');
  currentPage = signal(1);
  pageSize = signal(3);

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

  goToPage(page: number): void {
  this.currentPage.set(page);
}

  filteredPackages = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory().toLowerCase();

    return this.packages.filter(pack => {
      const matchesSearch =
        pack.title.toLowerCase().includes(term) ||
        pack.destination.toLowerCase().includes(term) ||
        pack.category.toLowerCase().includes(term);

      const matchesCategory =
        category === 'todas' ||
        pack.category.toLowerCase() === category;

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

  logout() {
    this.authState.clearSession();
    this.router.navigateByUrl('/login');
  }
}
