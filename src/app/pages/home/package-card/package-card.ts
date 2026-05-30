import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-package-card',
  imports: [RouterLink],
  templateUrl: './package-card.html',
  styleUrl: './package-card.css',
  standalone: true
})
export class PackageCard {
    pack = input.required<any>();
}
