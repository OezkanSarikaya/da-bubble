import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {

  constructor(private userService: UserService){}
  goBack(){
    this.userService.goBack();
  }
}
