import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';

import { DEFAULT_ADMIN_PAGE_SIZE } from '../../../core/constants/pagination';
import { PaginatedResponse } from '../../../core/models/paginated-response';
import {
  Reservation,
  ReservationStatus,
} from '../../../core/models/reservation';
import { Reservations } from '../../../core/services/reservations';

import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';

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
  ],
  templateUrl: './admin-reservations.html',
})
export class AdminReservations {
  private reservationsService = inject(Reservations);

  reservationsResponse = signal<PaginatedResponse<Reservation>>({
    data: [],
    total: 0,
    page: 1,
    limit: DEFAULT_ADMIN_PAGE_SIZE,
    totalPages: 0,
  });

  statusFilter = signal<ReservationStatusFilter>('all');
  currentPage = signal(1);

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(page = 1): void {
    const status =
      this.statusFilter() === 'all'
        ? undefined
        : this.statusFilter() as ReservationStatus;

    this.reservationsService
      .getAll(page, DEFAULT_ADMIN_PAGE_SIZE, status)
      .subscribe({
        next: (response) => {
          this.reservationsResponse.set(response);
          this.currentPage.set(response.page);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  onStatusChange(event: Event): void {
    const value = (
      event.target as HTMLSelectElement
    ).value as ReservationStatusFilter;

    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadReservations(1);
  }

  goToPage(page: number): void {
    this.loadReservations(page);
  }

  updateStatus(reservation: Reservation, status: ReservationStatus): void {
    this.reservationsService.updateStatus(reservation.id, status).subscribe({
      next: () => {
        this.loadReservations(this.currentPage());
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteReservation(reservation: Reservation): void {
    this.reservationsService.delete(reservation.id).subscribe({
      next: () => {
        this.loadReservations(this.currentPage());
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
