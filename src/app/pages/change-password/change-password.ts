import { Component, inject, signal } from '@angular/core';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Users } from '../../core/services/users';
import { AuthState } from '../../core/auth/auth-state';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    Header,
    Footer,
    RouterLink,
    FormField,
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private usersService = inject(Users);
  private authState = inject(AuthState);
  private router = inject(Router);

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  model = signal<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  passwordForm = form(this.model, (path) => {
    required(path.currentPassword, { message: 'La contraseña actual es requerida' });
    required(path.newPassword, { message: 'La nueva contraseña es requerida' });
    required(path.confirmPassword, { message: 'La confirmación es requerida' });

    validate(path.confirmPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(path.newPassword)) {
        return {
          kind: 'passwordMismatch',
          message: 'Las contraseñas no coinciden',
        };
      }

      return null;
    });
  });

  onSubmit(event: Event): void {
    event.preventDefault();

    this.successMessage.set(null);
    this.errorMessage.set(null);

    if (this.passwordForm().invalid()) {
      this.errorMessage.set('Completá correctamente todos los campos.');
      return;
    }

    const user = this.authState.user();

    if (!user) {
      this.errorMessage.set('No hay una sesión activa.');
      return;
    }

    const formValue = this.model();

    this.isLoading.set(true);

    this.usersService.update(user.id, {
      password: formValue.newPassword,
    }).subscribe({
      next: () => {
        this.successMessage.set('Contraseña actualizada correctamente.');

        setTimeout(() => {
          this.router.navigateByUrl('/profile');
        }, 1000);
      },
      error: (error) => {
        console.error(error);

        this.errorMessage.set(
          error?.error?.error?.message ||
          error?.error?.message ||
          'No se pudo actualizar la contraseña.'
        );
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/profile');
  }
}
