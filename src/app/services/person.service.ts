import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';
import { Register } from '../interfaces/register';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PersonService {

  constructor(private firestore: Firestore) {}

  // Methode zum Abrufen aller Benutzerdaten
  getAllUsers(): Observable<any[]> {
    const personsCollection = collection(this.firestore, 'users');
    return collectionData(personsCollection, { idField: 'id' }); // Echtzeit-Stream
  }
}
