import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  constructor(private userService: UserService){}
  goBack(){
    this.userService.goBack();
  }
}
