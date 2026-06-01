import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CartState } from '../../core/cart/cart-state';
import { Reservations } from '../../core/services/reservations';
import { AuthState } from '../../core/auth/auth-state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-offcanvas',
  imports: [CurrencyPipe],
  templateUrl: './cart-offcanvas.html',
  styleUrl: './cart-offcanvas.css',
})
export class CartOffcanvas {
  private readonly cartState = inject(CartState);
  private reservationsService = inject(Reservations);
  private authState = inject(AuthState);
  reservationCreated = signal(false);
  private router = inject(Router);

  item = this.cartState.item;
  hasItem = this.cartState.hasItem;
  total = this.cartState.total;

  canIncreasePassengers = computed(() => {
    const cartItem = this.item();

    if (!cartItem) return false;

    return cartItem.passengers < cartItem.package.availableSlots;
  });

  increasePassengers(): void {
    const cartItem = this.item();

    if (!cartItem) return;

    if (cartItem.passengers >= cartItem.package.availableSlots) {
      return;
    }

    this.cartState.increasePassengers();
  }

  decreasePassengers(): void {
    this.cartState.decreasePassengers();
  }

  removeItem(): void {
    this.reservationCreated.set(false);
    this.cartState.removeItem();
  }

  confirmReservation(): void {
    const cartItem = this.item();

    if (!cartItem) {
      return;
    }
    if (!this.authState.isAuthenticated()) {
      alert('Debés iniciar sesión para realizar una reserva');
      return;
    }
    this.reservationsService.create({
      packageId: cartItem.package.id,
      totalPassengers: cartItem.passengers,
    }).subscribe({
      next: () => {
        this.cartState.clear();
        this.reservationCreated.set(true);
      },

      error: (error) => {
        console.error(error);

        const message =
          error?.error?.error?.message ??
          'No se pudo crear la reserva';

        alert(message);
      },
    });
  }

  resetReservationMessage(): void {
    this.reservationCreated.set(false);
  }

  clear(): void {
    this.cartState.clear();

    localStorage.removeItem('cart');
  }

  goToProfile(): void {
    this.resetReservationMessage();

    const offcanvasElement = document.getElementById('cartOffcanvas');

    if (offcanvasElement) {
      const bootstrap = (window as any).bootstrap;
      const instance = bootstrap?.Offcanvas.getInstance(offcanvasElement);
      instance?.hide();
    }

    this.router.navigateByUrl('/profile');
  }
}
