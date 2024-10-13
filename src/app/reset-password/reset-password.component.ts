import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  person = {
    password: "",
    confirmPassword: ""
  }
  oobCode: string | null = null;

  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    console.log(this.oobCode);
  }

  sendPassword(ngForm: NgForm){
    if (ngForm.submitted && ngForm.form.valid) {
      if(this.person.password === this.person.confirmPassword){
        this.userService.resetPassword(this.oobCode, this.person.password)
        console.log(ngForm);
      }else{
        console.log('password are wrong');
      }
      this.router.navigate(['/']);
    }
  }
}
