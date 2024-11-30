import { Component, Input, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { hideUserProfile, triggerPopUserProfile } from '../../state/actions/triggerComponents.actions';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-popup-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup-user-profile.component.html',
  styleUrl: './popup-user-profile.component.scss'
})
export class PopupUserProfileComponent {
  avatar: string = './assets/img/img_profile/profile1.png';
  subscription: Subscription = new Subscription();
  areYou!: any
  @Input() currentUser!: User

  constructor(private store:Store<any>, private userService: UserService){}

  ngOnInit(): void {
    const subAreYou = this.userService.currentUser$.subscribe(user => {
      this.areYou = user;    
      console.log(this.areYou); 
    });
    this.subscription.add(subAreYou);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentUser'] && changes['currentUser'].currentValue) {
      changes['currentUser'].currentValue;
      console.log(this.currentUser);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();    
  }

  triggerUserProfilePopUp(event: Event){
    event.stopPropagation();
    this.store.dispatch(triggerPopUserProfile());
  }

  triggerUserEditProfile(event: Event){
    event.stopPropagation();
    this.store.dispatch(hideUserProfile());
  }
}
