import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Register } from '../interfaces/register';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  newUser: Register = {
    fullName: '',
    email: '',
    password: '',
    acceptTerm: false,
    avatar: ''
  };
  private newUser$: BehaviorSubject<Register> = new BehaviorSubject<Register>(this.newUser)

  constructor(private auth: Auth) {}
  private firestore: Firestore = inject(Firestore);

  getUser(): Observable<Register>{
    return this.newUser$.asObservable();
  }

  setUser(user: Register): void{
    this.newUser$.next(user);
  }

  async register(email: string, password: string, fullname: string, avatarURL: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        console.log('User registered:', userCredential);
      })
      .catch((error) => {
        console.error('Registration error:', error);
      });

    try {
      const userCollection = collection(this.firestore, 'users'); // Referenziert die 'users'-Sammlung
      const result = await addDoc(userCollection, { "fullname":fullname, "email":email, "avatar":avatarURL }); // Fügt ein Dokument zur Sammlung hinzu 
       
    } catch (error) {
      console.error('Error adding user: ', error);
    }
  }

  async login(){

  }


}
