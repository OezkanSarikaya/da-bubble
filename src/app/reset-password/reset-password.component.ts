import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';
import { MessageComponent } from '../shared/message/message.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, MessageComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  person = {
    password: "",
    confirmPassword: ""
  }

  oobCode: string | null = null;
  showMessage: boolean = false;
  messageToShow: string = '';
  messages = {
    success: 'Anmelden',
    failed: 'Passwörter stimmen nicht überein'
  }

  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
  }

  animationMessage(){
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 2000);
  }

  sendPassword(ngForm: NgForm){ 
    if (ngForm.submitted && ngForm.form.valid) {
      if(this.person.password === this.person.confirmPassword){
        this.userService.resetPassword(this.oobCode, this.person.password);
        this.messageToShow = this.messages.success;
        this.animationMessage();
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 3000);
      }else{
        this.messageToShow = this.messages.failed;
        this.animationMessage();
      }
      
    }
  }
}
