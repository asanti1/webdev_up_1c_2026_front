import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}


interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  cellphoneNumber: string;
  countryId: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}


@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  login(data: LoginRequest) {
    return this.http.post<string>('http://localhost:8000/auth/login', data);
  }


  register(data: RegisterRequest) {
    return this.http.post<RegisterResponse>('http://localhost:8000/auth/register', data);
  }
}
