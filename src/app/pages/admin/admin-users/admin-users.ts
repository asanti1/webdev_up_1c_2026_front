import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';

import { Country } from '../../../core/models/country';
import { User, UserRoleName } from '../../../core/models/user';

import { Countries } from '../../../core/services/countries';
import {
  UserCreatePayload,
  UserUpdatePayload,
  Users,
} from '../../../core/services/users';
import { paginate } from '../../../core/utils/paginate';
import { API_LIST_LIMIT, DEFAULT_ADMIN_PAGE_SIZE } from '../../../core/constants/pagination';
import { AdminEmptyState } from '../admin-empty-state/admin-empty-state';
import { AdminPageHeader } from '../admin-page-header/admin-page-header';
import { AdminSearchInput } from "../admin-search-input/admin-search-input";

type RoleFilter = UserRoleName | 'all';

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
    AdminSearchInput
],
  templateUrl: './admin-users.html',
})
export class AdminUsers {
  private usersService = inject(Users);
  private countriesService = inject(Countries);

  users = signal<User[]>([]);
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

  isEditing = computed(() => this.editingUser() !== null);

  searchTerm = signal('');
  roleFilter = signal<RoleFilter>('all');

  currentPage = signal(1);
  pageSize = signal(DEFAULT_ADMIN_PAGE_SIZE);

  ngOnInit(): void {
    this.loadUsers();
    this.loadCountries();
  }

  loadUsers(): void {
    this.usersService.getAll(1, API_LIST_LIMIT).subscribe({
      next: (response) => {
        this.users.set(response.data);
      },
      error: console.error,
    });
  }

  loadCountries(): void {
    this.countriesService.getAll(1, 50).subscribe({
      next: (response) => {
        this.countryOptions.set(response.data);
      },
      error: console.error,
    });
  }

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const role = this.roleFilter();

    return this.users().filter(user => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.country.name.toLowerCase().includes(term);

      const matchesRole =
        role === 'all' ||
        user.role.name === role;

      return matchesSearch && matchesRole;
    });
  });

  usersResponse = computed(() =>
    paginate(
      this.filteredUsers(),
      this.currentPage(),
      this.pageSize(),
    )
  );

  onSearch(event: Event): void {
    this.searchTerm.set(
      (event.target as HTMLInputElement).value
    );

    this.currentPage.set(1);
  }

  onRoleChange(event: Event): void {
    this.roleFilter.set(
      (event.target as HTMLSelectElement).value as RoleFilter
    );

    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
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
          ? (value === '' ? null : Number(value))
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
        next: () => this.loadUsers(),
        error: console.error,
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
        this.loadUsers();
        this.currentPage.set(1);
      },
      error: console.error,
    });
  }

  deleteUser(user: User): void {
    const confirmed = confirm(
      `¿Seguro que querés eliminar a ${user.firstName} ${user.lastName}?`
    );

    if (!confirmed) return;

    this.usersService.delete(user.id).subscribe({
      next: () => this.loadUsers(),
      error: console.error,
    });
  }

  roleClass(role: UserRoleName): string {
    return role === 'ADMIN'
      ? 'text-bg-danger'
      : 'text-bg-primary';
  }
}
