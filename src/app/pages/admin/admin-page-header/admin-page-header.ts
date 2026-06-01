import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-page-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-page-header.html',
})
export class AdminPageHeader {
  title = input.required<string>();
  description = input.required<string>();

  buttonLabel = input<string | null>(null);
  modalTarget = input<string | null>(null);

  createClicked = output<void>();

  onCreateClick(): void {
    this.createClicked.emit();
  }
}
