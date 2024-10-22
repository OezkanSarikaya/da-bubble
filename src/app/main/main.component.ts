import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ChannelComponent } from './channel/channel.component';
import { ThreadComponent } from './thread/thread.component';
import { CommonModule } from '@angular/common';
import { PopupUserProfileComponent } from '../shared/popup-user-profile/popup-user-profile.component';
import { Store } from '@ngrx/store';
import { triggerPopUserProfile } from '../state/actions/triggerComponents.actions';
import { Observable } from 'rxjs';
import { showHideThreadSelector, triggerUserProfilePopUpSelector } from '../state/selectors/triggerComponents.selectors';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceComponent,
    ChannelComponent,
    ThreadComponent,
    CommonModule,
    PopupUserProfileComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  // Zustand, ob die Thread-Komponente sichtbar ist
  isThreadVisible: boolean = false;
  isChannelSelected: boolean = false;
  isNewMessageOpen = false;

  userProfilePopUp$: Observable<boolean> = new Observable();
  isThreadVisible$: Observable<boolean> = new Observable();

  constructor(private store:Store<any>){}

  ngOnInit(): void {
    this.userProfilePopUp$ = this.store.select(triggerUserProfilePopUpSelector);
    this.isThreadVisible$ = this.store.select(showHideThreadSelector)
  }


  // Methode zum Ändern des Zustands
  toggleThreadVisibility() {
    this.isThreadVisible = !this.isThreadVisible;
  }

  // Methode zum expliziten Einblenden der Thread-Komponente
  showThread() {
    this.isThreadVisible = true;
  }

  // Methode zum expliziten Einblenden der Channel-Komponente
  showChannel() {
    this.isChannelSelected = true;
    // alert('Channel offen?: '+this.isChannelSelected);
  }

  hideChannel() {
    if (!this.isChannelSelected) {
      this.toggleNewMessage();
    }
    this.isChannelSelected = false;
    this.hideThread();
  
    
    // alert('Channel offen?: '+this.isChannelSelected);
  }

  // Methode zum expliziten Ausblenden der Thread-Komponente
  hideThread() {
    this.isThreadVisible = false;
  }

  toggleNewMessage() {
    this.isNewMessageOpen = !this.isNewMessageOpen;
    // alert('Neue Nachricht '+this.isNewMessageOpen);
    if (this.isNewMessageOpen) {
      document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
    }
    else {
      document.body.classList.remove('no-scroll'); // Scrollen auf der Seite deaktivieren
    }
  }

}
