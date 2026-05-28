import { Component, computed, inject, output } from '@angular/core';
import { AuthState } from '../../core/auth/auth-state';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  searchChange = output<string>();

  private readonly searchSubject = new Subject<string>();
  private readonly searchSubscription: Subscription;
  private lastSearch = '';
  private readonly authState = inject(AuthState);

  user = this.authState.user;
  isAuthenticated = this.authState.isAuthenticated;


  constructor() {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
      )
      .subscribe(value => {

        if (value === this.lastSearch) {
          return;
        }

        this.lastSearch = value;
        this.searchChange.emit(value);
      });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  submitSearch(value: string, event: Event): void {
    event.preventDefault();
    if (value === this.lastSearch) {
      return;
    }
    this.lastSearch = value;

    this.searchChange.emit(value);
  }

  logout(): void {
    this.authState.clearSession();
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

}
