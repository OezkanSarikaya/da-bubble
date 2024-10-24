import { Component } from '@angular/core';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent {
  avatar: string = './assets/img/img_profile/profile1.png'
}
