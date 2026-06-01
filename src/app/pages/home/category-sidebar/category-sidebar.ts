import { Component, input, output } from '@angular/core';
import { inject, OnInit, signal } from '@angular/core';
import { CategoryPackages } from '../../../core/services/category-packages';

@Component({
  selector: 'app-category-sidebar',
  imports: [],
  templateUrl: './category-sidebar.html',
  styleUrl: './category-sidebar.css',
})
export class CategorySidebar {
  selectedCategory = input.required<string>();
  categoryPackagesService = inject(CategoryPackages);
  categories = signal<string[]>(['Todas']);
  selectedCategoryChange = output<string>();


  ngOnInit(): void {
    this.categoryPackagesService.getAll(1, 50).subscribe({
      next: (response) => {
        this.categories.set([
          'Todas',
          ...response.data.map(category => category.name),
        ]);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  selectCategory(category: string): void {
    this.selectedCategoryChange.emit(category);
  }
}
