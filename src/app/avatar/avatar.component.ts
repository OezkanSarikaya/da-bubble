import { Component, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type register = {
  fullName: string;
  email: string;
  password: string;
  acceptTerm: boolean
};


@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  person: register = {
    fullName: '',
    email: '',
    password: '',
    acceptTerm: false
  };

  constructor(private auth: Auth, private router: Router) {}

  private firestore: Firestore = inject(Firestore);

  async register(email: string, password: string, fullname: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        console.log('User registered:', userCredential);
      })
      .catch((error) => {
        console.error('Registration error:', error);
      });

      // Add a new document in collection "cities"
    // await setDoc(doc(db, "cities", "LA"), {
    //   name: "Los Angeles",
    //   state: "CA",
    //   country: "USA"
    // });


    try {
      const userCollection = collection(this.firestore, 'users'); // Referenziert die 'users'-Sammlung
      const result = await addDoc(userCollection, { "fullname":fullname, "email":email, "avatar":"" }); // Fügt ein Dokument zur Sammlung hinzu 
       
    } catch (error) {
      console.error('Error adding user: ', error);
    }

  }

  onSubmit(ngForm: NgForm) {
    // alert(this.person.email);

    if (ngForm.submitted && ngForm.form.valid) {
      this.router.navigate(['avatar'])    
      // this.register(this.person.email, this.person.password, this.person.fullName);
      // ngForm.resetForm();
    }



    // this.register(this.person.email, this.person.password)
  }
}
