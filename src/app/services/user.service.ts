import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, confirmPasswordReset    } from '@angular/fire/auth';
import { Firestore, collection, addDoc, getDoc, doc, query, where, getDocs } from '@angular/fire/firestore';
import { Register } from '../interfaces/register';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Location } from '@angular/common';

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

  constructor(private auth: Auth, private location: Location) {}
  private firestore: Firestore = inject(Firestore);

  getUser(): Observable<Register>{
    return this.newUser$.asObservable();
  }

  setUser(user: Register): void{
    this.newUser$.next(user);
  }

  async register(email: string, password: string, fullname: string, avatarURL: string) {
    // createUserWithEmailAndPassword(this.auth, email, password)
    //   .then((userCredential) => {
    //     console.log('User registered:', userCredential);
    //   })
    //   .catch((error) => {
    //     console.error('Registration error:', error);
    //   });

    try {
      await createUserWithEmailAndPassword(this.auth, email, password)
      const userCollection = collection(this.firestore, 'users'); // Referenziert die 'users'-Sammlung
      const result = await addDoc(userCollection, { "fullname":fullname, "email":email, "avatar":avatarURL }); // Fügt ein Dokument zur Sammlung hinzu 
      return result;
    } catch (error) {
      console.error('Error adding user: ', error);
      return null;
    }
  }

  async login(email: string, password: string): Promise<any> {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential; 
    } catch (error) {
      console.error("Error during login:", error);
      const empty = ''
      return empty;  
    }
  }

  async logout(): Promise<any>{
    const auth = getAuth();
    try {
      await signOut(auth); 
    } catch (error) {
      console.error('Error during sing out', error);
    } 
  }

  async recoveryPassword(email: string){
    const auth = getAuth();
    const actionCodeSettings = {
      url: environment.resetPasswordURL, 
      handleCodeInApp: true,
    };
    try {
      const usersRef = collection(this.firestore, 'users'); 
      const q = query(usersRef, where("email", "==", email)); 
      const querySnapshot = await getDocs(q); 
      console.log(querySnapshot);
      if(!querySnapshot.empty){
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        return true;
      }else{
        console.log('error');
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  }

  async resetPassword(oobCode: string | null, newPassword: string){
    if (oobCode) {
      const auth = getAuth();
      try {
        await confirmPasswordReset(auth, oobCode, newPassword)
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }

  goBack(){
    this.location.back()
  }
}
