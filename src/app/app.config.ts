import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from './environment/environment';
import { getStorage, provideStorage } from '@angular/fire/storage';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() =>
      initializeApp(environment.firebase)
    ),
    provideDatabase(() => getDatabase()), // Initialisiere die Realtime Database
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()), 
    provideStorage(() => getStorage()), 
  ],
};
