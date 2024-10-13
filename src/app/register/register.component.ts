import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormsModule, NgForm } from '@angular/forms';
import { Register } from '../interfaces/register';
import { UserService } from '../services/user.service';

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
    acceptTerm: false,
    avatar: ''
  };
 
  constructor(private router: Router, private userService: UserService) {}

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      this.userService.setUser(this.person);
      this.router.navigate(['avatar'])    
    }
  }

  goBack(){
    this.userService.goBack();
  }
}
