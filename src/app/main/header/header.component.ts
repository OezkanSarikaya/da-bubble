import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchComponent,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  popupLoggedInUser = false;
  isBackdropVisible = false;
  closePopup = false;
  @Input()
  isChannelVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  @Output() hideChannel = new EventEmitter<void>(); // Gibt das Ausblenden nach außen

  // Methode zum Ausblenden der Thread-Komponente
  hide() {
    this.hideChannel.emit(); // Sendet das Ereignis an die Eltern-Komponente
  }
 

  // openLoggedInUser() {
  //   this.popupLoggedInUser = !this.popupLoggedInUser;
  
  // }



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
