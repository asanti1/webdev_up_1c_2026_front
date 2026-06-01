import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/paginated-response';
import { TravelPackage } from '../models/travel-package';
import { environment } from '../../../enviroments/enviroment';
import { API_LIST_LIMIT } from '../constants/pagination';

export type PackageCreatePayload = {
  title: string;
  description: string;
  price: number;
  startDate: string | null;
  endDate: string | null;
  maxSlots: number;
  imageUrl: string;
  categoryPackageId: string;
  destinationId: string;
};

export type PackageUpdatePayload = {
  title?: string;
  description?: string;
  price?: number;
  startDate?: string | null;
  endDate?: string | null;
  availableSlots?: number;
  maxSlots?: number;
  imageUrl?: string;
  isActive?: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class Packages {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/packages`;

  getAll(page = 1, limit = API_LIST_LIMIT) {
    return this.http.get<PaginatedResponse<TravelPackage>>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  getById(id: string) {
    return this.http.get<TravelPackage>(`${this.apiUrl}/${id}`);
  }

  create(payload: PackageCreatePayload) {
    return this.http.post<TravelPackage>(this.apiUrl, payload);
  }

  update(id: string, payload: PackageUpdatePayload) {
    return this.http.put<TravelPackage>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
