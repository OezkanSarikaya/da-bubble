import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './services/user.service';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);  // Den UserService einfügen
  const router = inject(Router);            // Den Router einfügen

  // Warte, bis der Authentifizierungsstatus geladen wurde
  return userService.isAuthenticated$.pipe(
    take(1),  // Nur den aktuellen Auth-Status holen
    switchMap(isAuthenticated => {
      // Wenn noch kein Auth-Status vorhanden, warte bis onAuthStateChanged abgeschlossen ist
      if (isAuthenticated === null) {
        return userService.currentUser$.pipe(
          take(1),
          map(user => {
            if (user) {
              console.log('User authenticated:', user.email);
              return true;  // Benutzer ist authentifiziert
            } else {
              console.log('User not authenticated, redirecting to login...');
              router.navigate(['/']);
              return false;  // Zugriff verweigern
            }
          })
        );
      }

      if (isAuthenticated) {
        return of(true);  // Benutzer ist bereits authentifiziert
      } else {
        console.log('User not authenticated, redirecting to login...');
        router.navigate(['/']);
        return of(false);  // Zugriff verweigern
      }
    })
  );
};
