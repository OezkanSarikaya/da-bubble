import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormsModule, NgForm } from '@angular/forms';
import { Register } from '../interfaces/register';
import { UserService } from '../services/user.service';
// import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
// import { doc, setDoc } from "firebase/firestore"; 
// import { Firestore, collection, addDoc } from '@angular/fire/firestore';

// type register = {
//   fullName: string;
//   email: string;
//   password: string;
//   acceptTerm: boolean
// };

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  person: Register = {
    fullName: '',
    email: '',
    password: '',
    acceptTerm: false
  };

  // isAllField: boolean = false;
  // errorForm: register = {
  //   name: true,
  //   email: true,
  //   password: true,
  // };

  constructor(private router: Router, private userService: UserService) {}

  // private firestore: Firestore = inject(Firestore);

  // async register(email: string, password: string, fullname: string) {
  //   createUserWithEmailAndPassword(this.auth, email, password)
  //     .then((userCredential) => {
  //       console.log('User registered:', userCredential);
  //     })
  //     .catch((error) => {
  //       console.error('Registration error:', error);
  //     });

  //     // Add a new document in collection "cities"
  //   // await setDoc(doc(db, "cities", "LA"), {
  //   //   name: "Los Angeles",
  //   //   state: "CA",
  //   //   country: "USA"
  //   // });


  //   try {
  //     const userCollection = collection(this.firestore, 'users'); // Referenziert die 'users'-Sammlung
  //     const result = await addDoc(userCollection, { "fullname":fullname, "email":email, "avatar":"" }); // Fügt ein Dokument zur Sammlung hinzu 
       
  //   } catch (error) {
  //     console.error('Error adding user: ', error);
  //   }

  // }

  // clearPlaceholder(event: any) {
  //   event.target.placeholder = '';
  // }

  // restorePlaceholder(event: any, placeholderText: string) {
  //   if (!event.target.value) {
  //     event.target.placeholder = placeholderText;
  //   }
  // }

  onSubmit(ngForm: NgForm) {
    // alert(this.person.email);

    if (ngForm.submitted && ngForm.form.valid) {
      this.userService.setUser(this.person);
      this.router.navigate(['avatar'])    
      // this.register(this.person.email, this.person.password, this.person.fullName);
      // ngForm.resetForm();
    }



    // this.register(this.person.email, this.person.password)
  }
}
