import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss'
})
export class RecoverPasswordComponent {
  isAllField: boolean = true;
  
  person = {
    email: ''
  }

  constructor(private userService: UserService){}

  sendEmail(ngForm: NgForm){
    if (ngForm.submitted && ngForm.form.valid) {
      console.log(ngForm);
      this.userService.recoveryPassword(this.person.email); 
    }
  }
  
}
