import { Component, EventEmitter, Input, Output, OnInit  } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { triggerPopUserProfile } from '../../state/actions/triggerComponents.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchComponent,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  currentUser: any = null;
  popupLoggedInUser = false;
  isBackdropVisible = false;
  closePopup = false;
  @Input() isChannelVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit
  @Input() isNewMessageVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit
  @Output() hideChannel = new EventEmitter<void>(); // Gibt das Ausblenden nach außen

  constructor(private userService: UserService, private router: Router, private store:Store<any>){}

  triggerUserProfilePopUp(){
    this.store.dispatch(triggerPopUserProfile());
  }

  ngOnInit() {
    // Abonniere den aktuellen Benutzer
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;      
    });
  }

  // Methode zum Ausblenden der Thread-Komponente
  hide() {
    this.hideChannel.emit(); // Sendet das Ereignis an die Eltern-Komponente
    
  }

  async logOut(){
    try {
      await this.userService.logout();
      this.router.navigate(['/']); 
    } catch (error) {
      console.log('Logout failed', error);
    }
  }


  openLoggedInUser() {
    // this.isChannelInfoOpen = !this.isChannelInfoOpen;

    if (!this.popupLoggedInUser) {
      // Backdrop wird angezeigt
      this.isBackdropVisible = true;
      // Kleines Timeout, um das Display: none aufzuheben, bevor die Opacity-Animation startet
      setTimeout(() => {
        this.popupLoggedInUser = true;
        document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
      }, 10);
    } else {
      // Blende den Backdrop aus
      this.popupLoggedInUser = false;  
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
      setTimeout(() => {
        this.isBackdropVisible = false;
        document.body.classList.remove('no-scroll');  
        this.closePopup = true;
            
      }, 125);  // Dauer der CSS-Transition (300ms)
    }
  }

}
