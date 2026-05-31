import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { Auth } from '../../../core/auth/auth';
import { AuthState } from '../../../core/auth/auth-state';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})

export class Login {
  private authService = inject(Auth);
  private authState = inject(AuthState);
  private router = inject(Router);
  private readonly location = inject(Location);
  errorMessage = signal<string | null>(null);

  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El email es requerido' });
    email(schemaPath.email, { message: 'Ingresa un email valido, ejemplo: ejemplo@ejemplo.com' });
    required(schemaPath.password, { message: 'La contraseña es requerida' });
  });


  goBack(): void {
    this.location.back();
  }
  onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage.set(null);
    this.authService.login(this.loginModel()).subscribe({
      next: (token) => {
        this.authState.setToken(token);
        this.authState.setUserFromToken(token);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage.set('Email o contraseña incorrectos');
          return;
        }

        this.errorMessage.set('Ocurrió un error al iniciar sesión');
      }
    })
  }

}


