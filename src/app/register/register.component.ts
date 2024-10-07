import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormsModule, NgForm } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

type register = {
  name: boolean;
  email: boolean;
  password: boolean;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  person = {
    fullName: '',
    email: '',
    password: '',
  };

  // isAllField: boolean = false;
  // errorForm: register = {
  //   name: true,
  //   email: true,
  //   password: true,
  // };

  constructor(private auth: Auth) {}

  register(email: string, password: string) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        console.log('User registered:', userCredential);
      })
      .catch((error) => {
        console.error('Registration error:', error);
      });
  }

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
      this.register(this.person.email, this.person.password);
      ngForm.resetForm();
     
    }



    // this.register(this.person.email, this.person.password)
  }
}
