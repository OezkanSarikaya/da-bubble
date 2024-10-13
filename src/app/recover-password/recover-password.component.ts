import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { MessageComponent } from '../shared/message/message.component';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, MessageComponent],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss'
})
export class RecoverPasswordComponent {
  isAllField: boolean = true;
  
  person = {
    email: ''
  }
  showMessage: boolean = false;
  messageToShow: string = '';
  messages = {
    success: 'E-Mail gesendet',
    failed: 'Falsche E-Mail'
  }

  constructor(private userService: UserService){}

  animationMessage(){
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 2000);
  }

  async sendEmail(ngForm: NgForm){
    if (ngForm.submitted && ngForm.form.valid) {
      const result = await this.userService.recoveryPassword(this.person.email); 
      if(result){
        this.messageToShow = this.messages.success;
        this.animationMessage();
      }else{
        this.messageToShow = this.messages.failed;
        this.animationMessage();
      }
    }
  }
  
}
