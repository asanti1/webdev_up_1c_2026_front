import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

interface ReservationMock {
  id: string;
  reservationDate: string;
  totalPassengers: number;
  finalPrice: number;
  notes: string | null;
  status: ReservationStatus;
  destination: {
    id: string;
    name: string;
  };
  package: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [Header, Footer, RouterLink, PackagePagination, CurrencyPipe, DatePipe],
  templateUrl: './admin-reservations.html',
  styleUrl: './admin-reservations.css',
})
export class AdminReservations {
  reservations = signal<ReservationMock[]>([
    {
      id: '1',
      reservationDate: '2026-05-20T10:30:00.000Z',
      totalPassengers: 2,
      finalPrice: 1700000,
      notes: 'Viajan dos adultos.',
      status: 'pending',
      destination: { id: '1', name: 'Bariloche' },
      package: {
        id: '1',
        title: 'Bariloche Aventura',
        startDate: '2026-07-10',
        endDate: '2026-07-17',
      },
      user: {
        id: '1',
        firstName: 'Juan',
        lastName: 'Test',
        email: 'juan.test@example.com',
      },
    },
    {
      id: '2',
      reservationDate: '2026-05-21T14:15:00.000Z',
      totalPassengers: 1,
      finalPrice: 620000,
      notes: null,
      status: 'confirmed',
      destination: { id: '2', name: 'Mendoza' },
      package: {
        id: '2',
        title: 'Mendoza Relax',
        startDate: '2026-08-05',
        endDate: '2026-08-10',
      },
      user: {
        id: '2',
        firstName: 'María',
        lastName: 'Gómez',
        email: 'maria.gomez@example.com',
      },
    },
    {
      id: '3',
      reservationDate: '2026-05-22T09:45:00.000Z',
      totalPassengers: 4,
      finalPrice: 3920000,
      notes: 'Familia con dos menores.',
      status: 'cancelled',
      destination: { id: '3', name: 'Ushuaia' },
      package: {
        id: '3',
        title: 'Ushuaia Fin del Mundo',
        startDate: '2026-09-12',
        endDate: '2026-09-18',
      },
      user: {
        id: '3',
        firstName: 'Carlos',
        lastName: 'Pérez',
        email: 'carlos.perez@example.com',
      },
    },
  ]);

  searchTerm = signal('');
  statusFilter = signal<ReservationStatus | 'all'>('all');
  currentPage = signal(1);
  pageSize = signal(5);

  filteredReservations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();

    return this.reservations().filter(reservation => {
      const matchesSearch =
        reservation.package.title.toLowerCase().includes(term) ||
        reservation.destination.name.toLowerCase().includes(term) ||
        reservation.user.firstName.toLowerCase().includes(term) ||
        reservation.user.lastName.toLowerCase().includes(term) ||
        reservation.user.email.toLowerCase().includes(term);

      const matchesStatus =
        status === 'all' ||
        reservation.status === status;

      return matchesSearch && matchesStatus;
    });
  });

  reservationsResponse = computed(() => {
    const filtered = this.filteredReservations();
    const page = this.currentPage();
    const limit = this.pageSize();
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      total,
      page,
      limit,
      totalPages,
    };
  });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ReservationStatus | 'all';

    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  updateStatus(reservation: ReservationMock, status: ReservationStatus): void {
    this.reservations.update(current =>
      current.map(item =>
        item.id === reservation.id
          ? { ...item, status }
          : item
      )
    );
  }

  deleteReservation(reservation: ReservationMock): void {
    const confirmed = confirm(`¿Seguro que querés cancelar la reserva de ${reservation.user.firstName} ${reservation.user.lastName}?`);

    if (!confirmed) return;

    this.reservations.update(current =>
      current.map(item =>
        item.id === reservation.id
          ? { ...item, status: 'cancelled' }
          : item
      )
    );
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
