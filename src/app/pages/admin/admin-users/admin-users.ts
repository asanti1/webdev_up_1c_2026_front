import { Component, computed, inject, signal } from '@angular/core';

import {
  API_LIST_LIMIT,
  DEFAULT_ADMIN_PAGE_SIZE,
} from '../../../core/constants/pagination';
import { Country } from '../../../core/models/country';
import { PaginatedResponse } from '../../../core/models/paginated-response';
import { User, UserRoleName } from '../../../core/models/user';
import { Countries } from '../../../core/services/countries';
import {
  UserCreatePayload,
  Users,
  UserUpdatePayload,
} from '../../../core/services/users';

import { Footer } from '../../footer/footer';
import { Header } from '../../header/header';
import { PackagePagination } from '../../home/package-pagination/package-pagination';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';

type UserFormModel = {
  firstName: string;
  lastName: string;
  email: string;
  cellphoneNumber: string;
  age: number | null;
  countryId: string;
  role: UserRoleName;
  password: string;
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    Header,
    Footer,
    PackagePagination,
    AdminPageHeader,
    AdminEmptyState,
  ],
  templateUrl: './admin-users.html',
})
export class AdminUsers {
  private usersService = inject(Users);
  private countriesService = inject(Countries);

  countryOptions = signal<Country[]>([]);

  roleOptions = [
    { id: '1', name: 'USER' as UserRoleName },
    { id: '2', name: 'ADMIN' as UserRoleName },
  ];

  editingUser = signal<User | null>(null);

  userForm = signal<UserFormModel>({
    firstName: '',
    lastName: '',
    email: '',
    cellphoneNumber: '',
    age: null,
    countryId: '',
    role: 'USER',
    password: '',
  });

  usersResponse = signal<PaginatedResponse<User>>({
    data: [],
    total: 0,
    page: 1,
    limit: DEFAULT_ADMIN_PAGE_SIZE,
    totalPages: 0,
  });

  currentPage = signal(1);

  isEditing = computed(() => this.editingUser() !== null);

  ngOnInit(): void {
    this.loadUsers();
    this.loadCountries();
  }

  loadUsers(page = 1): void {
    this.usersService.getAll(page, DEFAULT_ADMIN_PAGE_SIZE).subscribe({
      next: (response) => {
        this.usersResponse.set(response);
        this.currentPage.set(response.page);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  loadCountries(): void {
    this.countriesService.getAll(1, API_LIST_LIMIT).subscribe({
      next: (response) => {
        this.countryOptions.set(response.data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  goToPage(page: number): void {
    this.loadUsers(page);
  }

  openCreateModal(): void {
    this.editingUser.set(null);

    this.userForm.set({
      firstName: '',
      lastName: '',
      email: '',
      cellphoneNumber: '',
      age: null,
      countryId: '',
      role: 'USER',
      password: '',
    });
  }

  openEditModal(user: User): void {
    this.editingUser.set(user);

    this.userForm.set({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      cellphoneNumber: user.cellphoneNumber,
      age: user.age,
      countryId: user.country.id,
      role: user.role.name,
      password: '',
    });
  }

  updateFormField(field: keyof UserFormModel, event: Event): void {
    const value =
      (event.target as HTMLInputElement | HTMLSelectElement).value;

    this.userForm.update(current => ({
      ...current,
      [field]:
        field === 'age'
          ? value === '' ? null : Number(value)
          : value,
    }));
  }

  saveUser(): void {
    const form = this.userForm();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.cellphoneNumber.trim() ||
      !form.countryId ||
      !form.age
    ) {
      return;
    }

    const editing = this.editingUser();

    if (editing) {
      const payload: UserUpdatePayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        cellphoneNumber: form.cellphoneNumber.trim(),
        age: form.age,
        countryId: form.countryId,
      };

      this.usersService.update(editing.id, payload).subscribe({
        next: () => {
          this.loadUsers(this.currentPage());
        },
        error: (error) => {
          console.error(error);
        },
      });

      return;
    }

    if (!form.password.trim()) {
      return;
    }

    const payload: UserCreatePayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      cellphoneNumber: form.cellphoneNumber.trim(),
      age: form.age,
      countryId: form.countryId,
    };

    this.usersService.create(payload).subscribe({
      next: () => {
        this.currentPage.set(1);
        this.loadUsers(1);

        this.userForm.set({
          firstName: '',
          lastName: '',
          email: '',
          cellphoneNumber: '',
          age: null,
          countryId: '',
          role: 'USER',
          password: '',
        });
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  deleteUser(user: User): void {
    const confirmed = confirm(
      `¿Seguro que querés eliminar a ${user.firstName} ${user.lastName}?`
    );

    if (!confirmed) return;

    this.usersService.delete(user.id).subscribe({
      next: () => {
        this.loadUsers(this.currentPage());
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  roleClass(role: UserRoleName): string {
    return role === 'ADMIN'
      ? 'text-bg-danger'
      : 'text-bg-primary';
  }
}
