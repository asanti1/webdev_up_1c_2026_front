import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CartState } from '../../core/cart/cart-state';
import { Reservations } from '../../core/services/reservations';
import { AuthState } from '../../core/auth/auth-state';

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

  item = this.cartState.item;
  hasItem = this.cartState.hasItem;
  total = this.cartState.total;

  increasePassengers(): void {
    this.cartState.increasePassengers();
  }

  decreasePassengers(): void {
    this.cartState.decreasePassengers();
  }

  removeItem(): void {
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
        alert('Reserva creada correctamente');
        this.cartState.clear();
        const offcanvasElement = document.getElementById('cartOffcanvas');

        if (offcanvasElement) {
          const bootstrap =
            (window as any).bootstrap;

          const instance =
            bootstrap?.Offcanvas.getInstance(offcanvasElement);

          instance?.hide();
        }
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

  clear(): void {
    this.cartState.clear();

    localStorage.removeItem('cart');
  }
}
