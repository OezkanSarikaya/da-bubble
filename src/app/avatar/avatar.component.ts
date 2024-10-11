import { Component, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { Register } from '../interfaces/register';

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
  // person: register = {
  //   fullName: '',
  //   email: '',
  //   password: '',
  //   acceptTerm: false
  // };

  person!: Register;

  constructor(private auth: Auth, private router: Router, private userService: UserService) {}

  private firestore: Firestore = inject(Firestore);

  ngOnInit(): void {
    this.userService.getUser().subscribe(p => {
      this.person = p;
    }); 
    console.log(this.person);
  }

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

  registerDataBase(){
    if(this.person.acceptTerm){
      this.register(this.person.email, this.person.password, this.person.fullName);
    }
  }

  // onSubmit(ngForm: NgForm) {
  //   // alert(this.person.email);

  //   if (ngForm.submitted && ngForm.form.valid) {
  //     this.router.navigate(['avatar'])    
  //     // this.register(this.person.email, this.person.password, this.person.fullName);
  //     // ngForm.resetForm();
  //   }



  //   // this.register(this.person.email, this.person.password)
  // }
}
