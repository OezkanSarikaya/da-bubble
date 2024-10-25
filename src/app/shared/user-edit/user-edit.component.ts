import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { hideUserProfile, triggerPopUserProfile } from '../../state/actions/triggerComponents.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent {
  currentUser!: any
  subscription: Subscription = new Subscription();
  avatars = [
		"./assets/img/img_profile/profile1.png",
		"./assets/img/img_profile/profile2.png",
		"./assets/img/img_profile/profile3.png",
		"./assets/img/img_profile/profile4.png",
		"./assets/img/img_profile/profile5.png",
		"./assets/img/img_profile/profile6.png",
	];
  showSelectAvatars: boolean = true;

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

  triggerShowHideSelectAvatars(){
    this.showSelectAvatars = !this.showSelectAvatars;
  }

  async onSubmitEdit(editForm: NgForm){
    if (editForm.submitted && editForm.form.valid) {
      await this.userService.updateUser('uid', this.currentUser.uid, editForm.value);
      this.store.dispatch(triggerPopUserProfile());
      this.store.dispatch(hideUserProfile());
    }
  }

  triggerUserProfilePopUp(event: Event){
    event.stopPropagation();
    this.store.dispatch(triggerPopUserProfile());
    this.store.dispatch(hideUserProfile());
  }

  selectAvatar(profile: any){
    console.log(profile);
  }
}
