import { inject, Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  GoogleAuthProvider,
  signInWithPopup,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  getDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import {
  Database,
  ref as dbRef,
  set,
  onValue,
  getDatabase,
} from '@angular/fire/database';
import { Register } from '../interfaces/register';
import { BehaviorSubject, Observable, ReplaySubject, from } from 'rxjs';
import { environment } from '../environment/environment';
import { Location } from '@angular/common';
import {
  ref,
  Storage,
  uploadBytes,
  getDownloadURL,
} from '@angular/fire/storage';
import { Router } from '@angular/router';
import { PersonService } from './person.service'; // Importiere den PersonService

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private db: Database;
  newUser: Register = {
    fullName: '',
    email: '',
    password: '',
    acceptTerm: false,
    avatar: '',
  };
  private newUser$: BehaviorSubject<Register> = new BehaviorSubject<Register>(
    this.newUser
  );
  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated$: Observable<boolean> =
    this.isAuthenticatedSubject.asObservable();
  private currentUserSubject: BehaviorSubject<any | null> = new BehaviorSubject(
    null
  );
  public currentUser$: Observable<any | null> =
    this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private location: Location,
    private storage: Storage,
    private personService: PersonService,
    private router: Router
  ) {
    this.db = inject(Database);
    this.checkAuthState();
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  setUserStatus(userId: string, status: string) {
    const userStatusRef = dbRef(this.db, `status/${userId}`);
    set(userStatusRef, status)
      .then(() => {
        // console.log(`User status for ${userId} set to ${status}`);
      })
      .catch((error) => {
        console.error('Error setting user status:', error);
      });
  }

  getUserStatus(uid: string): Observable<string> {
    const userStatusRef = dbRef(this.db, `status/${uid}`);

    return new Observable((observer) => {
      onValue(userStatusRef, (snapshot) => {
        const status = snapshot.val();
        if (status) {
          observer.next(status); // Online- oder Offline-Status als String zurückgeben
        } else {
          observer.next('offline'); // Fallback auf "offline"
        }
      });
    });
  }

  private checkAuthState() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.isAuthenticatedSubject.next(true);

        // Hole die erweiterten Benutzerdaten von Firestore
        const userData = await this.personService.getUserDataByEmail(
          user.email!
        );
        if (userData) {
          const fullUserData = {
            ...user,
            fullName: userData.fullName,
            avatar: userData.avatar,
          };

          // Speichere die erweiterten Benutzerdaten
          localStorage.setItem('currentUser', JSON.stringify(fullUserData));
          this.currentUserSubject.next(fullUserData);

          // Setze den Benutzerstatus auf "online", wenn er authentifiziert ist
          this.setUserStatus(user.uid, 'online');
        }
      } else {
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
      }
    });
  }

  private firestore: Firestore = inject(Firestore);

  getUser(): Observable<Register> {
    return this.newUser$.asObservable();
  }

  getUsers(): Observable<any[]> {
    const userCollection = collection(this.firestore, 'users');
    const usersSubject = new BehaviorSubject<any[]>([]);

    // Escuchar cambios en la colección en tiempo real
    onSnapshot(userCollection, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      usersSubject.next(users); // Emitimos los usuarios actualizados
    });

    return usersSubject.asObservable(); // Convertimos el BehaviorSubject a un Observable
  }

  setUser(user: Register): void {
    this.newUser$.next(user);
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    avatarURL: string
  ) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      // console.log("userCredential UID", user.uid);

      const userCollection = collection(this.firestore, 'users');

      const result = await addDoc(userCollection, {
        uid: user.uid,
        fullName: fullName,
        email: email,
        avatar: avatarURL,
      });

      return result;
    } catch (error) {
      console.error('Error adding user: ', error);
      return error;
    }
  }

  async login(email: string, password: string): Promise<any> {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      this.isAuthenticatedSubject.next(true);
      this.setUserStatus(userCredential.user.uid, 'online');
      // console.log(`Benutzer ${userCredential.user.uid} ist online`);

      const userData = await this.personService.getUserDataByEmail(email);
      if (userData) {
        const fullUserData = {
          ...userCredential.user,
          fullName: userData.fullName,
          avatar: userData.avatar,
        };

        localStorage.setItem('currentUser', JSON.stringify(fullUserData));
        this.currentUserSubject.next(fullUserData);
      }

      return userCredential;
    } catch (error) {
      console.error('Error during login:', error);
      return null;
    }
  }

  async logout(): Promise<any> {
    const auth = getAuth();
    const currentUser = this.getCurrentUser();

    try {
      if (currentUser) {
        this.setUserStatus(currentUser.uid, 'offline');
      }
      await signOut(auth);
      this.isAuthenticatedSubject.next(false);
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Error during sign out', error);
    }
  }

  getCurrentUser(): any {
    return this.currentUserSubject.getValue();
  }

  async recoveryPassword(email: string) {
    const auth = getAuth();
    const actionCodeSettings = {
      url: environment.resetPasswordURL,
      handleCodeInApp: true,
    };
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  async resetPassword(oobCode: string | null, newPassword: string) {
    if (oobCode) {
      const auth = getAuth();
      try {
        await confirmPasswordReset(auth, oobCode, newPassword);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  }

  goBack() {
    this.location.back();
  }

  selectImage($event: any) {
    const file = $event.target.files[0];
    return file;
  }

  async uploadImage(file: any, fullName: string) {
    try {
      const imgRef = ref(this.storage, `avatars/${file.name}-${fullName}`);
      await uploadBytes(imgRef, file);
      const downloadURL = await getDownloadURL(imgRef);
      return downloadURL;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      return null;
    }
  }

  async loginWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(this.auth, provider);
      this.setUserStatus(userCredential.user.uid, 'online');
      return userCredential;
    } catch (error) {
      console.error('Error during Google login:', error);
      return null;
    }
  }

  saveDataRegisterLocalStorage(newUser: any) {
    localStorage.setItem('user-register', JSON.stringify(newUser));
  }

  loadDataRegisterLocalStorage() {
    let userRegisterText = localStorage.getItem('user-register');
    if (userRegisterText) {
      let userRegister = JSON.parse(userRegisterText);
      return userRegister;
    }
  }

  cleanDataRegisterLocalStorage() {
    localStorage.removeItem('user-register');
  }

  async updateUser(field:string, value: string, updatedData: any) {
    try {
      const userDocRef = await this.findUserByField(field, value);
      if(userDocRef){
        await updateDoc(userDocRef.ref, updatedData);
        console.log("Usuario actualizado en Firestore.");
        // Update currentUserSubject with new Data
        const updatedUserSnapshot = await getDoc(userDocRef.ref);
        const updatedUserData = updatedUserSnapshot.data();
        if (updatedUserData) {
          const currentUser = this.getCurrentUser();
          const fullUpdatedUserData = {
            ...currentUser,
            ...updatedUserData
          };
          this.updateCurrentUser(fullUpdatedUserData);
        }
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  }

  updateCurrentUser(updatedUser: any) {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
  }
  
  async findUserByField(field: string, value: string) {
    const usersRef = collection(this.firestore, "users");
    const q = query(usersRef, where(field, "==", value));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0];
    } else {
      console.log("Usuario no encontrado.");
      return null;
    }
  }

}
