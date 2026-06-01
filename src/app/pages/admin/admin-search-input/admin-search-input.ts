import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-admin-search-input',
  standalone: true,
  templateUrl: './admin-search-input.html',
  styleUrl: './admin-search-input.css',
})
export class AdminSearchInput {
  placeholder = input('Buscar...');
  searchChange = output<Event>();

  onInput(event: Event): void {
    this.searchChange.emit(event);
  }
}
