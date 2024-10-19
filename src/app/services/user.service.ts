import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, getAuth, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, confirmPasswordReset, GoogleAuthProvider, signInWithPopup    } from '@angular/fire/auth';
import { Firestore, collection, addDoc, getDoc, doc, query, where, getDocs } from '@angular/fire/firestore';
import { Register } from '../interfaces/register';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Location } from '@angular/common';
import { ref, Storage, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  var = '';
  newUser: Register = {
    fullName: '',
    email: '',
    password: '',
    acceptTerm: false,
    avatar: ''
  };
  private newUser$: BehaviorSubject<Register> = new BehaviorSubject<Register>(this.newUser)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(private auth: Auth, private location: Location, private storage:Storage) {

    this.checkAuthState();
  }



  private checkAuthState() {
    const auth = getAuth();  // Firebase Auth-Instanz holen
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.isAuthenticatedSubject.next(true);  // Benutzer ist eingeloggt
      } else {
        this.isAuthenticatedSubject.next(false); // Kein Benutzer eingeloggt
      }
    });
  }


  private firestore: Firestore = inject(Firestore);

  getUser(): Observable<Register>{
    return this.newUser$.asObservable();
  }

  setUser(user: Register): void{
    this.newUser$.next(user);
  }

  async register(email: string, password: string, fullname: string, avatarURL: string) {
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
      this.isAuthenticatedSubject.next(true); 
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
      this.isAuthenticatedSubject.next(false); 
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

  selectImage($event: any){
    const file = $event.target.files[0];
    return file;
    // console.log(file);
  }

  async uploadImage(file: any, fullName: string){
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
      return userCredential; 
    } catch (error) {
      console.error('Error during Google login:', error);
      return null;
    }
  }

  saveDataRegisterLocalStorage(newUser: any){
    localStorage.setItem('user-register', JSON.stringify(newUser));
  }

  loadDataRegisterLocalStorage(){
    let userRegisterText = (localStorage.getItem('user-register'));
    if(userRegisterText){
      let userRegister = JSON.parse(userRegisterText);
      return userRegister;
    }
  }

  cleanDataRegisterLocalStorage(){
    localStorage.removeItem('user-register');
  }

}
