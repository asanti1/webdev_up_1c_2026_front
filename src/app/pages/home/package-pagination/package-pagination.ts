import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-package-pagination',
  standalone: true,
  imports: [],
  templateUrl: './package-pagination.html',
})
export class PackagePagination {

  currentPage = input.required<number>();
  totalPages = input.required<number>();

  pageChange = output<number>();

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 1) {
      return [];
    }

    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, '...', total];
    }

    if (current >= total - 2) {
      return [1, '...', total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  });

  goToPage(page: number | string): void {
    if (typeof page !== 'number') {
      return;
    }

    if (page < 1 || page > this.totalPages()) {
      return;
    }

    if (page === this.currentPage()) {
      return;
    }

    this.pageChange.emit(page);
  }

  previous(): void {
    this.goToPage(this.currentPage() - 1);
  }

  next(): void {
    this.goToPage(this.currentPage() + 1);
  }
}
