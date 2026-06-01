import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';
import { AuthState, AuthUser } from '../../core/auth/auth-state';
import { Reservation } from '../../core/models/reservation';
import { Reservations } from '../../core/services/reservations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [Header, Footer, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly reservationsService = inject(Reservations);

  user = this.authState.user;

  reservations = signal<Reservation[]>([]);
  isLoadingReservations = signal(false);
  isEditing = signal(false);

  ngOnInit(): void {
    this.loadReservations();
  }


  editModel = signal({
    firstName: '',
    lastName: '',
    email: '',
    cellphoneNumber: '',
  });

  fullName = computed(() => {
    const user = this.user();

    if (!user) return '';

    return `${user.firstName} ${user.lastName}`;
  });

  loadReservations(): void {
    this.isLoadingReservations.set(true);

    this.reservationsService.getAllMe(1, 50).subscribe({
      next: (response) => {
        this.reservations.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.isLoadingReservations.set(false);
      },
    });
  }

  startEdit(): void {
    const user = this.user();

    if (!user) return;

    this.editModel.set({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      cellphoneNumber: user.cellphoneNumber ?? '',
    });

    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  updateField(field: keyof ReturnType<typeof this.editModel>, event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.editModel.update(current => ({
      ...current,
      [field]: value,
    }));
  }

  saveProfile(): void {
    const currentUser = this.user();

    if (!currentUser) return;

    const updatedUser: AuthUser = {
      ...currentUser,
      ...this.editModel(),
    };

    this.authState.setUser(updatedUser);
    this.isEditing.set(false);
  }

  logout(): void {
    this.authState.clearSession();
    this.router.navigateByUrl('/login');
  }
}
