import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-category-sidebar',
  imports: [],
  templateUrl: './category-sidebar.html',
  styleUrl: './category-sidebar.css',
})
export class CategorySidebar {
  selectedCategory = input.required<string>();

  selectedCategoryChange = output<string>();

  categories = [
    'Todas',
    'Aventura',
    'Relax',
    'Cultural',
    'Naturaleza',
  ];

  selectCategory(category: string): void {
    this.selectedCategoryChange.emit(category);
  }
}
