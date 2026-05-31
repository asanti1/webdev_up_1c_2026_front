import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';
import { PackagePagination } from '../../home/package-pagination/package-pagination';

type UserRole = 'USER' | 'ADMIN';

interface Option {
  id: string;
  name: string;
}

interface UserMock {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  cellphoneNumber: string;
  role: {
    id: string;
    name: UserRole;
  };
  country: {
    id: string;
    name: string;
    isoCode: string;
  };
}

type UserFormModel = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  cellphoneNumber: string;
  role: UserRole;
  countryId: string;
};

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [Header, Footer, RouterLink, PackagePagination],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers {
  countryOptions = [
    { id: '1', name: 'Argentina', isoCode: 'ARG' },
    { id: '2', name: 'Brasil', isoCode: 'BRA' },
    { id: '3', name: 'Chile', isoCode: 'CHL' },
  ];

  roleOptions: Option[] = [
    { id: '1', name: 'USER' },
    { id: '2', name: 'ADMIN' },
  ];

  users = signal<UserMock[]>([
    {
      id: '1',
      firstName: 'Admin',
      lastName: 'Sistema',
      age: 30,
      email: 'admin@test.com',
      cellphoneNumber: '2215551234',
      role: { id: '2', name: 'ADMIN' },
      country: { id: '1', name: 'Argentina', isoCode: 'ARG' },
    },
    {
      id: '2',
      firstName: 'Juan',
      lastName: 'Test',
      age: 28,
      email: 'juan.test@example.com',
      cellphoneNumber: '2215555678',
      role: { id: '1', name: 'USER' },
      country: { id: '1', name: 'Argentina', isoCode: 'ARG' },
    },
    {
      id: '3',
      firstName: 'María',
      lastName: 'Gómez',
      age: 35,
      email: 'maria.gomez@example.com',
      cellphoneNumber: '1144556677',
      role: { id: '1', name: 'USER' },
      country: { id: '2', name: 'Brasil', isoCode: 'BRA' },
    },
  ]);

  editingUser = signal<UserMock | null>(null);

  userForm = signal<UserFormModel>({
    firstName: '',
    lastName: '',
    age: 18,
    email: '',
    cellphoneNumber: '',
    role: 'USER',
    countryId: '',
  });

  isEditing = computed(() => this.editingUser() !== null);

  searchTerm = signal('');
  roleFilter = signal<UserRole | 'all'>('all');
  currentPage = signal(1);
  pageSize = signal(5);

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

  usersResponse = computed(() => {
    const filtered = this.filteredUsers();
    const page = this.currentPage();
    const limit = this.pageSize();
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      total,
      page,
      limit,
      totalPages,
    };
  });

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  onRoleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as UserRole | 'all';
    this.roleFilter.set(value);
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
      age: 18,
      email: '',
      cellphoneNumber: '',
      role: 'USER',
      countryId: '',
    });
  }

  openEditModal(user: UserMock): void {
    this.editingUser.set(user);

    this.userForm.set({
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      email: user.email,
      cellphoneNumber: user.cellphoneNumber,
      role: user.role.name,
      countryId: user.country.id,
    });
  }

  updateFormField(field: keyof UserFormModel, event: Event): void {
    const input = event.target as HTMLInputElement | HTMLSelectElement;

    const value =
      field === 'age'
        ? Number(input.value)
        : input.value;

    this.userForm.update(current => ({
      ...current,
      [field]: value,
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
      form.age <= 0
    ) {
      return;
    }

    const country = this.countryOptions.find(item => item.id === form.countryId);
    const role = this.roleOptions.find(item => item.name === form.role);

    if (!country || !role) {
      return;
    }

    const editing = this.editingUser();

    if (editing) {
      this.users.update(current =>
        current.map(user =>
          user.id === editing.id
            ? {
                ...user,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                age: form.age,
                email: form.email.trim(),
                cellphoneNumber: form.cellphoneNumber.trim(),
                role: {
                  id: role.id,
                  name: form.role,
                },
                country,
              }
            : user
        )
      );

      return;
    }

    const newUser: UserMock = {
      id: crypto.randomUUID(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      age: form.age,
      email: form.email.trim(),
      cellphoneNumber: form.cellphoneNumber.trim(),
      role: {
        id: role.id,
        name: form.role,
      },
      country,
    };

    this.users.update(current => [newUser, ...current]);
    this.currentPage.set(1);
  }

  deleteUser(user: UserMock): void {
    const confirmed = confirm(`¿Seguro que querés eliminar a ${user.firstName} ${user.lastName}?`);

    if (!confirmed) return;

    this.users.update(current =>
      current.filter(item => item.id !== user.id)
    );
  }

  roleClass(role: UserRole): string {
    return role === 'ADMIN'
      ? 'text-bg-danger'
      : 'text-bg-primary';
  }
}
