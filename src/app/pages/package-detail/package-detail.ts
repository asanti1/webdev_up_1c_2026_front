import { Component, computed, inject } from '@angular/core';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CartState } from '../../core/cart/cart-state';

@Component({
  selector: 'app-package-detail',
  imports: [Header, Footer, RouterLink],
  templateUrl: './package-detail.html',
  styleUrl: './package-detail.css',
})
export class PackageDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly cartState = inject(CartState);
  private readonly router = inject(Router);

  packageId = this.route.snapshot.paramMap.get('id');


  packages = [
    {
      id: '1',
      title: 'Bariloche Aventura',
      destination: 'Bariloche',
      category: 'Aventura',
      price: 850000,
      imageUrl: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849',
      availableSlots: 18,
      durationDays: 7,
      startDate: '2026-07-10',
      endDate: '2026-07-17',
      description:
        'Viví una experiencia única en Bariloche con excursiones, paisajes de montaña, lagos y actividades al aire libre.',
      includes: [
        'Alojamiento por 6 noches',
        'Traslados incluidos',
        'Excursión al Cerro Catedral',
        'Desayuno incluido',
      ],
    },
    {
      id: '2',
      title: 'Mendoza Relax',
      destination: 'Mendoza',
      category: 'Relax',
      price: 620000,
      imageUrl: 'https://images.unsplash.com/photo-1586359375748-338d21b5b592',
      availableSlots: 10,
      durationDays: 5,
      startDate: '2026-08-05',
      endDate: '2026-08-10',
      description:
        'Disfrutá Mendoza con bodegas, paisajes cordilleranos y días de descanso en una experiencia tranquila.',
      includes: [
        'Alojamiento por 4 noches',
        'Visita a bodegas',
        'Desayuno incluido',
        'Traslados internos',
      ],
    },
    {
      id: '3',
      title: 'Ushuaia Fin del Mundo',
      destination: 'Ushuaia',
      category: 'Naturaleza',
      price: 980000,
      imageUrl: 'https://images.unsplash.com/photo-1535837487710-a191373a20ae',
      availableSlots: 7,
      durationDays: 6,
      startDate: '2026-09-12',
      endDate: '2026-09-18',
      description:
        'Conocé Ushuaia, sus paisajes australes, excursiones, navegación y experiencias en el fin del mundo.',
      includes: [
        'Alojamiento por 5 noches',
        'Excursión al Parque Nacional',
        'Navegación por el Canal Beagle',
        'Guía turístico',
      ],
    },
    {
      id: '4',
      title: 'Salta Cultural',
      destination: 'Salta',
      category: 'Cultural',
      price: 540000,
      imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3',
      availableSlots: 14,
      durationDays: 4,
      startDate: '2026-10-01',
      endDate: '2026-10-05',
      description:
        'Recorré Salta, sus paisajes, arquitectura colonial, gastronomía regional y cultura del norte argentino.',
      includes: [
        'Alojamiento por 3 noches',
        'City tour',
        'Excursión a Cafayate',
        'Desayuno incluido',
      ],
    },
  ];

  addToCart(): void {
    const pack = this.selectedPackage();

    if (!pack) return;

    this.cartState.addPackage({
      id: pack.id,
      title: pack.title,
      destination: pack.destination,
      price: pack.price,
      imageUrl: pack.imageUrl,
    });

    this.router.navigateByUrl('/cart');
  }

  selectedPackage = computed(() =>
    this.packages.find(pack => pack.id === this.packageId)
  );
}
