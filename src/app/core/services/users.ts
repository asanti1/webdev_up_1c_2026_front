import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { PaginatedResponse } from '../models/paginated-response';
import { User, UserRoleName } from '../models/user';
import { environment } from '../../../enviroments/enviroment';
import { API_LIST_LIMIT } from '../constants/pagination';

export type UserCreatePayload = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  cellphoneNumber: string;
  countryId: string;
};

export type UserUpdatePayload = {
  firstName?: string;
  lastName?: string;
  age?: number;
  email?: string;
  cellphoneNumber?: string;
  countryId?: string;
  password?: string;
};

@Injectable({
  providedIn: 'root',
})
export class Users {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/users`;

  getAll(page = 1, limit = API_LIST_LIMIT) {
    return this.http.get<PaginatedResponse<User>>(
      `${this.apiUrl}/?page=${page}&limit=${limit}`
    );
  }

  getById(id: string) {
    return this.http.get<User>(
      `${this.apiUrl}/${id}`
    );
  }

  create(payload: UserCreatePayload) {
    return this.http.post<User>(
      this.apiUrl,
      payload
    );
  }

  update(id: string, payload: UserUpdatePayload) {
    return this.http.put<User>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  delete(id: string) {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
