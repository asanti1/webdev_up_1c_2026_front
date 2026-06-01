import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/paginated-response';
import { Destination } from '../models/destination';
import { environment } from '../../../enviroments/enviroment';
import { API_LIST_LIMIT } from '../constants/pagination';

export type DestinationPayload = {
  name: string;
  description: string;
  countryId: string;
};

@Injectable({
  providedIn: 'root',
})
export class Destinations {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/destinations`;

  getAll(page = 1, limit = API_LIST_LIMIT) {
    return this.http.get<PaginatedResponse<Destination>>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  getById(id: string) {
    return this.http.get<Destination>(`${this.apiUrl}/${id}`);
  }

  create(payload: DestinationPayload) {
    return this.http.post<Destination>(this.apiUrl, payload);
  }

  update(id: string, payload: DestinationPayload) {
    return this.http.put<Destination>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
