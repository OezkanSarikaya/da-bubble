import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ChannelComponent } from './channel/channel.component';
import { ThreadComponent } from './thread/thread.component';
import { CommonModule } from '@angular/common';
import { PopupUserProfileComponent } from '../shared/popup-user-profile/popup-user-profile.component';
import { Store } from '@ngrx/store';
import { hideThreadComponent, hideUserProfile, showNewMessage, triggerPopUserProfile } from '../state/actions/triggerComponents.actions';
import { Observable, take } from 'rxjs';
import { showHideThreadSelector, showHideUserEditProfileHeaderSelector, triggerChannelSelector, triggerNewMessageSelector, triggerUserProfilePopUpSelector } from '../state/selectors/triggerComponents.selectors';
import { UserEditComponent } from '../shared/user-edit/user-edit.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceComponent,
    ChannelComponent,
    ThreadComponent,
    CommonModule,
    PopupUserProfileComponent,
    UserEditComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  // Zustand, ob die Thread-Komponente sichtbar ist

  userProfilePopUp$: Observable<boolean> = new Observable();
  isThreadVisible$: Observable<boolean> = new Observable();
  isChannelSelected$: Observable<boolean> = new Observable();
  userEditProfile$: Observable<boolean> = new Observable(); 
  isNewMessageOpen$: Observable<boolean> = new Observable();

  constructor(private store:Store<any>){}

  ngOnInit(): void {
    this.userProfilePopUp$ = this.store.select(triggerUserProfilePopUpSelector);
    this.isThreadVisible$ = this.store.select(showHideThreadSelector);
    this.userEditProfile$ = this.store.select(showHideUserEditProfileHeaderSelector);
    this.isNewMessageOpen$ = this.store.select(triggerNewMessageSelector);
    this.isChannelSelected$ = this.store.select(triggerChannelSelector);
  }

  hideChannel() {
    this.store.dispatch(showNewMessage())
    this.store.dispatch(hideThreadComponent())
  }


  toggleNewMessage() {  
    if (this.isNewMessageOpen$) {
      document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
    }
    else {
      document.body.classList.remove('no-scroll'); // Scrollen auf der Seite deaktivieren
    }
  }

  closeUserProfile(){
    this.userEditProfile$.pipe(take(1)).subscribe(value=>{
      if(!value){
        this.store.dispatch(hideUserProfile())
      }
    })    
    this.store.dispatch(triggerPopUserProfile());
  }

}
