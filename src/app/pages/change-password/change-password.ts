import { Component, signal } from '@angular/core';
import { form, FormField, required, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

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
  successMessage = signal<string | null>(null);

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

    if (this.passwordForm().invalid()) {
      return;
    }

    this.successMessage.set('Contraseña actualizada correctamente (mock)');
  }


}
