import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { hideUserProfile, triggerPopUserProfile } from '../../state/actions/triggerComponents.actions';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent {
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

  async onSubmitEdit(editForm: NgForm){
    if (editForm.submitted && editForm.form.valid) {
      await this.userService.updateUser('uid', this.currentUser.uid, editForm.value);
    }
  }

  triggerUserProfilePopUp(){
    this.store.dispatch(triggerPopUserProfile());
    this.store.dispatch(hideUserProfile());
  }
}
