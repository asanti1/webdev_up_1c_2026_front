import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { API_LIST_LIMIT, DEFAULT_ADMIN_PAGE_SIZE } from '../../../core/constants/pagination';
import {
  Reservation,
  ReservationStatus,
} from '../../../core/models/reservation';
import { Reservations } from '../../../core/services/reservations';
import { paginate } from '../../../core/utils/paginate';
import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { AdminSearchInput } from "../admin-search-input/admin-search-input";

type ReservationStatusFilter = ReservationStatus | 'all';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    Header,
    Footer,
    PackagePagination,
    CurrencyPipe,
    DatePipe,
    AdminPageHeader,
    AdminEmptyState,
    AdminSearchInput
],
  templateUrl: './admin-reservations.html',
})
export class AdminReservations {
  private reservationsService = inject(Reservations);

  reservations = signal<Reservation[]>([]);

  searchTerm = signal('');
  statusFilter = signal<ReservationStatusFilter>('all');

  currentPage = signal(1);
  pageSize = signal(DEFAULT_ADMIN_PAGE_SIZE);

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    const status = this.statusFilter() === 'all'
      ? undefined
      : this.statusFilter() as ReservationStatus;

    this.reservationsService.getAll(1, API_LIST_LIMIT, status).subscribe({
      next: (response) => {
        this.reservations.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  filteredReservations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();

    return this.reservations().filter(reservation =>
      reservation.package.title.toLowerCase().includes(term) ||
      reservation.destination.name.toLowerCase().includes(term) ||
      reservation.user.firstName.toLowerCase().includes(term) ||
      reservation.user.lastName.toLowerCase().includes(term) ||
      reservation.user.email.toLowerCase().includes(term) ||
      reservation.status.toLowerCase().includes(term)
    );
  });

  reservationsResponse = computed(() =>
    paginate(
      this.filteredReservations(),
      this.currentPage(),
      this.pageSize(),
    )
  );

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ReservationStatusFilter;

    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadReservations();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  updateStatus(reservation: Reservation, status: ReservationStatus): void {
    this.reservationsService.updateStatus(reservation.id, status).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteReservation(reservation: Reservation): void {
    const confirmed = confirm(`¿Seguro que querés cancelar la reserva de ${reservation.user.firstName} ${reservation.user.lastName}?`);

    if (!confirmed) {
      return;
    }

    this.reservationsService.delete(reservation.id).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  statusLabel(status: ReservationStatus): string {
    const labels: Record<ReservationStatus, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
    };

    return labels[status];
  }

  statusClass(status: ReservationStatus): string {
    const classes: Record<ReservationStatus, string> = {
      pending: 'text-bg-warning',
      confirmed: 'text-bg-success',
      cancelled: 'text-bg-secondary',
    };

    return classes[status];
  }
}
