import { computed, Injectable, signal } from '@angular/core';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN' | string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'auth_user';

  private tokenState = signal<string | null>(localStorage.getItem(this.tokenKey));

  private userState = signal<AuthUser | null>(JSON.parse(localStorage.getItem(this.userKey) ?? 'null'));

  user = this.userState.asReadonly();
  token = this.tokenState.asReadonly();
  isAuthenticated = computed(() => this.token() !== null);


  setSession(token: string, user: AuthUser): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.tokenState.set(token);
    this.userState.set(user);

  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.tokenState.set(token);
  }

  setUser(user: AuthUser) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userState.set(user);
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    this.tokenState.set(null);
    this.userState.set(null);
  }

}
