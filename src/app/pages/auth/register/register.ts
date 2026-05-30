import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, min, required, validate } from '@angular/forms/signals';
import { Country, CountryService } from '../../../core/services/country';
import { Auth } from '../../../core/auth/auth';
import { AuthState } from '../../../core/auth/auth-state';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';

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
  styleUrl: './register.css',
})
export class Register {
  private countryService = inject(CountryService);
  private authService = inject(Auth);
  private authState = inject(AuthState);
  private router = inject(Router);
  private readonly location = inject(Location);

  countries = signal<Country[]>([]);
  isLoadingCountries = signal(false);
  countriesError = signal<string | null>(null);

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

    this.countryService.getAll().subscribe({
      next: (countries) => {
        this.countries.set(countries);
      },
      error: () => {
        this.countriesError.set('No se pudieron cargar los países');
      },
      complete: () => {
        this.isLoadingCountries.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.authService.register(this.registerModel()).subscribe({
      next: (user) => {
        console.log(user)
        this.authService.login({ email: this.registerModel().email, password: this.registerModel().password }).subscribe({
          next: (token) => {
            this.authState.setToken(token);
            this.authState.setUserFromToken(token);
            this.router.navigateByUrl('/');
          },
          error: (err) => {
            console.error(err);

          }
        })
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  registerForm = form(this.registerModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El email es requerido' });
    email(schemaPath.email, { message: 'Ingresa un email valido, ejemplo: ejemplo@ejemplo.com' });
    required(schemaPath.password, { message: 'La contraseña es requerida' });
    required(schemaPath.confirmPassword, { message: 'Requerido' });
    required(schemaPath.cellphoneNumber, { message: 'El numero de telefono es requerido' });
    min(schemaPath.age, 10, { message: `La edad debe ser mayor a 10` });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      const confirmPassword = value();
      const password = valueOf(schemaPath.password);
      if (confirmPassword !== password) return {
        kind: 'passwordMismatch',
        message: 'Las contraseñas no coinciden'
      }

      return null;

    })


  });

}
