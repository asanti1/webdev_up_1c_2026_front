import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface Country {
  id: string;
  name: string;
  isoCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<Country[]>('http://localhost:8000/countries/getAll');
  }
}
