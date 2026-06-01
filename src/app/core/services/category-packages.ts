import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PaginatedResponse } from '../models/paginated-response';
import { CategoryPackage } from '../models/category-package';
import { environment } from '../../../enviroments/enviroment';
import { API_LIST_LIMIT } from '../constants/pagination';

export type CategoryPackagePayload = {
  name: string;
  description: string;
};

@Injectable({
  providedIn: 'root',
})
export class CategoryPackages {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categoryPackages`;

  getAll(page = 1, limit = API_LIST_LIMIT) {
    return this.http.get<PaginatedResponse<CategoryPackage>>(
      `${this.apiUrl}?page=${page}&limit=${limit}`
    );
  }

  getById(id: string) {
    return this.http.get<CategoryPackage>(`${this.apiUrl}/${id}`);
  }

  create(payload: CategoryPackagePayload) {
    return this.http.post<CategoryPackage>(this.apiUrl, payload);
  }

  update(id: string, payload: CategoryPackagePayload) {
    return this.http.put<CategoryPackage>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
