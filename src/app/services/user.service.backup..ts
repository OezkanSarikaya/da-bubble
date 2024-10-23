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
        console.log(`User status for ${userId} set to ${status}`);
      })
      .catch((error) => {
        console.error('Error setting user status:', error);
      });
  }


  getUserStatus(uid: string): Observable<string> {
    const userStatusRef = dbRef(this.db, `status/${uid}`);
    
    // Überwache den Status des Benutzers
    return new Observable((observer) => {
      onValue(userStatusRef, (snapshot) => {
        const status = snapshot.val();
        
        if (status) {
          observer.next(status); // Gebe den Status (online/offline) zurück
        } else {
          observer.next('offline'); // Standardmäßig offline, falls kein Status gefunden wird
        }
      });
    });
  }
  

  private checkAuthState() {
    const auth = getAuth(); // Firebase Auth-Instanz holen
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // console.log("User is authenticated:", user.email);  // Debug-Log
        this.isAuthenticatedSubject.next(true);

        // Hole die erweiterten Benutzerdaten von Firestore
        const userData = await this.personService.getUserDataByEmail(
          user.email!
        );
        if (userData) {
          const fullUserData = {
            ...user,
            fullName: userData.fullname,
            avatar: userData.avatar,
          };

          // Speichere die erweiterten Benutzerdaten
          localStorage.setItem('currentUser', JSON.stringify(fullUserData));
          this.currentUserSubject.next(fullUserData);
        }
      } else {
        // console.log("User is not authenticated.");  // Debug-Log
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
    return from(
      getDocs(userCollection).then((snapshot) => {
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            // Hole die Benutzer-UID statt der Firestore-Dokument-ID, falls vorhanden
            id: data['uid'] || doc.id, // Annahme: du hast das 'uid' Feld in Firestore gespeichert
            ...data,
          };
        });
      })
    );
  }

  setUser(user: Register): void {
    this.newUser$.next(user);
  }


  async register(
    email: string,
    password: string,
    fullname: string,
    avatarURL: string
  ) {
    try {
      // Erstelle den Benutzer und erhalte die User-Credentials
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
  
      console.log("userCredential UID", user.uid);
  
      // Referenziere die 'users'-Sammlung in Firestore
      const userCollection = collection(this.firestore, 'users');
  
      // Speichere die Benutzerdaten inkl. UID in Firestore
      const result = await addDoc(userCollection, {
        uid: user.uid,  // Hier wird die UID des Benutzers gespeichert
        fullname: fullname,
        email: email,
        // password: password,
        avatar: avatarURL,
      });
  
      return result;
    } catch (error) {
      // Fange den Fehler ab und gebe eine Fehlermeldung aus
      console.error('Error adding user: ', error);
      return error
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
      // this.isAuthenticatedSubject  = true;
      this.setUserStatus(userCredential.user.uid, 'online');
      console.log(`Benutzer ${userCredential.user.uid} ist online`);
      // Hole die erweiterten Benutzerdaten von Firestore nach dem Login
      const userData = await this.personService.getUserDataByEmail(email);
      if (userData) {
        const fullUserData = {
          ...userCredential.user,
          fullName: userData.fullname,
          avatar: userData.avatar,
        };

        // Speichere die erweiterten Benutzerdaten
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
        // Setze den Status auf 'offline'
        this.setUserStatus(currentUser.uid, 'offline');
      }
      await signOut(auth);
      this.isAuthenticatedSubject.next(false);
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);


    } catch (error) {
      console.error('Error during sing out', error);
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
      console.log(querySnapshot);
      if (!querySnapshot.empty) {
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        return true;
      } else {
        console.log('error');
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
    // console.log(file);
  }

  async uploadImage(file: any, fullName: string) {
    try {
      const imgRef = ref(this.storage, `avatars/${file.name}-${fullName}`);
      await uploadBytes(imgRef, file); //Upload image

      const downloadURL = await getDownloadURL(imgRef); //reference in firebase to save in the user avatarURL
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
}
