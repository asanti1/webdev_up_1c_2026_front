import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Packages } from '../../core/services/packages';
import { TravelPackage } from '../../core/models/travel-package';
import { CartState } from '../../core/cart/cart-state';

@Component({
  selector: 'app-package-detail',
  standalone: true,
  imports: [Header, Footer, RouterLink, DatePipe],
  templateUrl: './package-detail.html',
  styleUrl: './package-detail.css',
})
export class PackageDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private packagesService = inject(Packages);
  private cartState = inject(CartState);

  selectedPackage = signal<TravelPackage | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Paquete no encontrado');
      return;
    }

    this.loading.set(true);

    this.packagesService.getById(id).subscribe({
      next: (pack) => {
        this.selectedPackage.set(pack);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el paquete');
        this.loading.set(false);
      },
    });
  }

  addToCart(): void {
    const pack = this.selectedPackage();

    if (!pack) return;

    this.cartState.addPackage({
      id: pack.id,
      title: pack.title,
      price: pack.price,
      imageUrl: pack.imageUrl,
      destination: pack.destination.name,
    });

    this.router.navigateByUrl('/cart');
  }
}
