import { computed, Injectable, signal } from '@angular/core';

export interface CartPackage {
  id: string;
  title: string;
  destination: string;
  price: number;
  imageUrl: string;
  availableSlots: number;
}

export interface CartItem {
  package: CartPackage;
  passengers: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartState {
  private readonly cartKey = 'travel_cart';

  private cartItemState = signal<CartItem | null>(
    JSON.parse(localStorage.getItem(this.cartKey) ?? 'null')
  );

  item = this.cartItemState.asReadonly();

  hasItem = computed(() => this.item() !== null);

  passengers = computed(() => this.item()?.passengers ?? 0);

  total = computed(() => {
    const item = this.item();

    if (!item) {
      return 0;
    }

    return item.package.price * item.passengers;
  });

  addPackage(packageItem: CartPackage): void {
    this.cartItemState.set({
      package: packageItem,
      passengers: 1,
    });

    this.persist();
  }

  increasePassengers(): void {
    const item = this.item();

    if (!item) return;

    this.cartItemState.set({
      ...item,
      passengers: item.passengers + 1,
    });

    this.persist();
  }

  decreasePassengers(): void {
    const item = this.item();

    if (!item) return;

    if (item.passengers <= 1) {
      return;
    }

    this.cartItemState.set({
      ...item,
      passengers: item.passengers - 1,
    });

    this.persist();
  }

  removeItem(): void {
    this.cartItemState.set(null);
    localStorage.removeItem(this.cartKey);
  }

  clear(): void {
    this.removeItem();
  }

  private persist(): void {
    const item = this.item();

    if (!item) {
      localStorage.removeItem(this.cartKey);
      return;
    }

    localStorage.setItem(this.cartKey, JSON.stringify(item));
  }
}
