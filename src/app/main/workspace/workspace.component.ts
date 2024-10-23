import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { PersonService } from '../../services/person.service';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'], // Hier den korrekten Schlüssel 'styleUrls' verwenden
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  persons: any[] = [];
  private subscriptions: Subscription[] = [];
  
  isCreateChannelOpen = false;
  isChannelOpen = true;
  isPrivateMessageOpen = true;
  isWorkspaceOpen = true;
  isAddChannelOpen = false;
  isBackdropVisible: boolean = false;

  constructor(
    private personService: PersonService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Benutzerliste abrufen
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe((users) => {
      this.persons = users; // Benutzerdaten speichern
      // console.log('Personen:', this.persons);

      // Online-Status für jeden Benutzer abrufen
      this.persons.forEach((person) => {
        // console.log(
        //   `Prüfe Online-Status für Person: ${person.fullname} mit ID: ${person.uid}`
        // );

        // Überprüfen ob person.uid korrekt übergeben wird
        if (!person.uid) {
          // console.error('UID für Person fehlt:', person);
          return; // Vorzeitiges Beenden, wenn UID fehlt
        }

        this.userService.getUserStatus(person.uid).subscribe((status) => {
          person.isOnline = status === 'online'; // Setze den Online-Status
          
          // Debug-Ausgabe für den gesetzten Status
          // console.log(
          //   `Online-Status für ${person.fullname}: ${person.isOnline}`
          // );

          this.cdr.detectChanges(); // Versuche die Change Detection zu erzwingen
        });
      });
    }, (error) => {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    });
  }

  ngOnDestroy() {
    // Unsubscribe von allen Realtime-Listenern
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  @Output() showChannel = new EventEmitter<void>(); // Ereignis zum Einblenden der Thread-Komponente

  @Input()
  isChannelVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  @Input()
  isNewMessageVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  // @Input()
  // isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  @Output() hideChannel = new EventEmitter<void>(); // Gibt das Ausblenden nach außen
  @Output() toggleNewMessage = new EventEmitter<void>(); // Gibt das Ausblenden nach außen

  // Methode zum Ausblenden der Thread-Komponente
  hide() {
    this.hideChannel.emit(); // Sendet das Ereignis an die Eltern-Komponente
  }

  // Methode, die das Einblenden auslöst
  onShowChannel() {
    this.showChannel.emit();
  }

  // Methode, die das Einblenden auslöst
  ontoggleNewMessage() {
    this.toggleNewMessage.emit();
  }

  togglePrivateMessage() {
    this.isPrivateMessageOpen = !this.isPrivateMessageOpen;
  }

  toggleChannels() {
    this.isChannelOpen = !this.isChannelOpen;
  }

  toggleWorkspace() {
    this.isWorkspaceOpen = !this.isWorkspaceOpen;
  }
  
  toggleAddChannel() {
    if (!this.isAddChannelOpen) {
      // Backdrop wird angezeigt
      this.isBackdropVisible = true;
      // Kleines Timeout, um das Display: none aufzuheben, bevor die Opacity-Animation startet
      setTimeout(() => {
        this.isAddChannelOpen = true;
        document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
      }, 10);
    } else {
      // Blende den Backdrop aus
      this.isAddChannelOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
      setTimeout(() => {
        this.isBackdropVisible = false;
        document.body.classList.remove('no-scroll');
      }, 300); // Dauer der CSS-Transition (300ms)
    }
  }
}
