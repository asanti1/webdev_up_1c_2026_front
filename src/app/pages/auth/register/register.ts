import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, min, required, validate } from '@angular/forms/signals';
import { Countries } from '../../../core/services/countries';
import { Auth } from '../../../core/auth/auth';
import { AuthState } from '../../../core/auth/auth-state';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { Country } from '../../../core/models/country';

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  age: number | null;
  cellphoneNumber: string;
  countryId: string;
  password: string;
  confirmPassword: string;
}
@Component({
  selector: 'app-register',
  imports: [FormField, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private countryService = inject(Countries);
  private authService = inject(Auth);
  private authState = inject(AuthState);
  private router = inject(Router);
  private readonly location = inject(Location);

  countries = signal<Country[]>([]);
  isLoadingCountries = signal(false);
  countriesError = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  registerModel = signal<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    age: null,
    cellphoneNumber: '',
    countryId: '',
    password: '',
    confirmPassword: '',
  });

  ngOnInit() {
    this.loadCountries();
  }

  private loadCountries() {
    this.isLoadingCountries.set(true);
    this.countriesError.set(null);

    this.countryService.getAll(1, 50).subscribe({
      next: (response) => {
        this.countries.set(response.data);
      },
      error: () => {
        this.countriesError.set('No se pudieron cargar los países');
        this.isLoadingCountries.set(false);
      },
      complete: () => {
        this.isLoadingCountries.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    this.errorMessage.set(null);

    if (this.registerForm().invalid()) {
      this.errorMessage.set('Completá correctamente todos los campos requeridos.');
      return;
    }

    const form = this.registerModel();

    this.authService.register(form).subscribe({
      next: () => {
        this.authService.login({
          email: form.email,
          password: form.password,
        }).subscribe({
          next: (token) => {
            this.authState.setToken(token);
            this.authState.setUserFromToken(token);
            this.router.navigateByUrl('/');
          },
          error: () => {
            this.errorMessage.set(
              'La cuenta fue creada, pero no se pudo iniciar sesión automáticamente.'
            );
          },
        });
      },
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage.set('Ya existe una cuenta con ese email.');
          return;
        }

        this.errorMessage.set('No se pudo crear la cuenta. Revisá los datos ingresados.');
      },
    });
  }

  registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.firstName, { message: 'El nombre es requerido' });
    required(schemaPath.lastName, { message: 'El apellido es requerido' });

    required(schemaPath.age, { message: 'La edad es requerida' });
    min(schemaPath.age, 10, { message: 'La edad debe ser mayor a 10' });

    required(schemaPath.email, { message: 'El email es requerido' });
    email(schemaPath.email, { message: 'Ingresá un email válido, ejemplo: ejemplo@ejemplo.com' });

    required(schemaPath.cellphoneNumber, { message: 'El número de teléfono es requerido' });

    required(schemaPath.countryId, { message: 'El país es requerido' });

    required(schemaPath.password, { message: 'La contraseña es requerida' });
    required(schemaPath.confirmPassword, { message: 'Requerido' });

    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      const confirmPassword = value();
      const password = valueOf(schemaPath.password);

      if (confirmPassword !== password) {
        return {
          kind: 'passwordMismatch',
          message: 'Las contraseñas no coinciden',
        };
      }

      return null;
    });
  });

}
