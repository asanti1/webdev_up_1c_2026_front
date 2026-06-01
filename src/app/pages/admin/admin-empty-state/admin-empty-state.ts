import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-empty-state',
  standalone: true,
  templateUrl: './admin-empty-state.html',
  styleUrl: './admin-empty-state.css',
})
export class AdminEmptyState {
  title = input.required<string>();
  description = input.required<string>();
}
