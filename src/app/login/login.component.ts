import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../services/user.service';
import { Login } from '../interfaces/login';
import { FormsModule, NgForm } from '@angular/forms';

type loginError = {
  email: boolean,
  password: boolean
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  //Chane here false after coding
  isPresentation:boolean = true;
  isAllField: boolean = true;
  
  personLogin: Login ={
    email: '',
    password: ''
  }

  constructor(private userService: UserService, private router: Router) {
    setTimeout(() => {
      this.presentationPlayed()
    }, 3500);
  }

  presentationPlayed(){
    this.isPresentation = true;
  }

  async login(ngForm: NgForm){
    if (ngForm.submitted && ngForm.form.valid) {
      const userCredential = await this.userService.login(this.personLogin.email, this.personLogin.password);
      if(userCredential.user && userCredential.user.email){
        console.log(userCredential);
        this.router.navigate(['/main']);
      }else{
        console.error('Login failed');
      }
    }
  }

}
