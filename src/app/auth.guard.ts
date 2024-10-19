import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './services/user.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);  // Den UserService einfügen
  const router = inject(Router);            // Den Router einfügen

  return userService.isAuthenticated$.pipe(
    take(1),  // Nur den aktuellen Auth-Status holen
    map(isAuthenticated => {
      console.log('Authenticated:', isAuthenticated); // Logging für Debugging
      if (isAuthenticated) {
        return true;  // Benutzer ist authentifiziert, Zugriff gewähren
      } else {  
        router.navigate(['']);
        // setTimeout(() => {
        //   router.navigate(['']);
        // }, 0);  // Sicherstellen, dass die Umleitung verzögert wird
        return false;  // Zugriff verweigern
      }
    })
  );
};
