import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { triggerPopUserProfile } from '../../state/actions/triggerComponents.actions';

@Component({
  selector: 'app-popup-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './popup-user-profile.component.html',
  styleUrl: './popup-user-profile.component.scss'
})
export class PopupUserProfileComponent {
  avatar: string = './assets/img/img_profile/profile1.png';

  constructor(private store:Store<any>){}

  triggerUserProfilePopUp(){
    this.store.dispatch(triggerPopUserProfile());
  }
}
