import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../header/header';
import { Footer } from '../../footer/footer';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [Header, Footer, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  sections = [
    {
      title: 'Paquetes',
      description: 'Crear, editar y administrar paquetes turísticos.',
      icon: 'bi-suitcase2',
      route: '/admin/packages',
    },
    {
      title: 'Destinos',
      description: 'Gestionar destinos disponibles para los paquetes.',
      icon: 'bi-geo-alt',
      route: '/admin/destinations',
    },
    {
      title: 'Categorías',
      description: 'Administrar tipos de paquetes turísticos.',
      icon: 'bi-tags',
      route: '/admin/categories',
    },
    {
      title: 'Reservas',
      description: 'Consultar y modificar el estado de reservas.',
      icon: 'bi-calendar-check',
      route: '/admin/reservations',
    },
    {
      title: 'Usuarios',
      description: 'Administrar usuarios registrados.',
      icon: 'bi-people',
      route: '/admin/users',
    },
    {
      title: 'Países',
      description: 'Gestionar países disponibles en el sistema.',
      icon: 'bi-globe-americas',
      route: '/admin/countries',
    },
  ];
}
