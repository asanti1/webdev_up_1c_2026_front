import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/paginated-response';
import { Reservation, ReservationStatus } from '../models/reservation';
import { environment } from '../../../enviroments/enviroment';

export type CreateReservationPayload = {
  packageId: string;
  totalPassengers: number;
  notes?: string;
};

@Injectable({
  providedIn: 'root',
})
export class Reservations {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reservations`;

  getAllMe(page = 1, limit = 50) {
    return this.http.get<PaginatedResponse<Reservation>>(
      `${this.apiUrl}/getAllMe?page=${page}&limit=${limit}`
    );
  }

  getAll(page = 1, limit = 50, status?: ReservationStatus) {
    const statusQuery = status ? `&status=${status}` : '';

    return this.http.get<PaginatedResponse<Reservation>>(
      `${this.apiUrl}?page=${page}&limit=${limit}${statusQuery}`
    );
  }

  create(payload: CreateReservationPayload) {
    return this.http.post<Reservation>(
      this.apiUrl,
      payload
    );
  }

  getById(id: string) {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: ReservationStatus) {
    return this.http.patch<Reservation>(
      `${this.apiUrl}/${id}?status=${status}`,
      {}
    );
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
