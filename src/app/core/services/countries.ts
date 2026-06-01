import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/paginated-response';
import { Country } from '../models/country';
import { environment } from '../../../enviroments/enviroment';
import { API_LIST_LIMIT } from '../constants/pagination';

export type CountryPayload = {
  name: string;
  isoCode: string;
};

@Injectable({
  providedIn: 'root',
})
export class Countries {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/countries`;

  getAll(page = 1, limit = API_LIST_LIMIT) {
    return this.http.get<PaginatedResponse<Country>>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  getById(id: string) {
    return this.http.get<Country>(`${this.apiUrl}/${id}`);
  }

  create(payload: CountryPayload) {
    return this.http.post<Country>(this.apiUrl, payload);
  }
}
