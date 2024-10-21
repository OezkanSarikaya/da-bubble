import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';
// import { Register } from '../interfaces/register';
// import { map } from 'rxjs/operators';

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

    // Funktion zum Abrufen von Benutzerdaten basierend auf der E-Mail
    async getUserDataByEmail(email: string): Promise<any> {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData;
      }
      return null;
    }
}
