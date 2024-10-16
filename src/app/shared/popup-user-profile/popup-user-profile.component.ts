import { Component } from '@angular/core';

@Component({
  selector: 'app-popup-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './popup-user-profile.component.html',
  styleUrl: './popup-user-profile.component.scss'
})
export class PopupUserProfileComponent {
  avatar: string = './assets/img/img_profile/profile1.png';
}
