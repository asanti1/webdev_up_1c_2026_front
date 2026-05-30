import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CartState } from '../../core/cart/cart-state';

@Component({
  selector: 'app-cart-offcanvas',
  imports: [CurrencyPipe],
  templateUrl: './cart-offcanvas.html',
  styleUrl: './cart-offcanvas.css',
})
export class CartOffcanvas {
  private readonly cartState = inject(CartState);

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
    console.log('Reserva mockeada:', this.item());
  }
}
