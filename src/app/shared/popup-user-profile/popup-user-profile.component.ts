import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { hideUserProfile, triggerPopUserProfile } from '../../state/actions/triggerComponents.actions';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-popup-user-profile',
  standalone: true,
  imports: [],
  templateUrl: './popup-user-profile.component.html',
  styleUrl: './popup-user-profile.component.scss'
})
export class PopupUserProfileComponent {
  avatar: string = './assets/img/img_profile/profile1.png';
  currentUser!: any
  subscription: Subscription = new Subscription();

  constructor(private store:Store<any>, private userService: UserService){}

  ngOnInit(): void {
    const sub = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;      
    });
    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();    
  }

  triggerUserProfilePopUp(){
    this.store.dispatch(triggerPopUserProfile());
  }

  triggerUserEditProfile(){
    this.store.dispatch(hideUserProfile());
  }
}
