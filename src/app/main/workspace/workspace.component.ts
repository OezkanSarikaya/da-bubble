import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { PersonService } from '../../services/person.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  persons: any[] = []; // Array zum Speichern der Benutzerdaten
  // isLoading: boolean = true; // Ladeindikator

  isCreateChannelOpen = false;
  isChannelOpen = true;
  isPrivateMessageOpen = true;
  isWorkspaceOpen = true;
  isAddChannelOpen = false;

  isBackdropVisible: boolean = false;

  constructor(private personService: PersonService) {}



  ngOnInit(): void {
    // Benutzerdaten beim Initialisieren der Komponente abrufen
    this.personService.getAllUsers().subscribe(
      (data) => {
        this.persons = data;  // Benutzer in das Array laden
        // this.isLoading = false;  // Ladeindikator beenden
      },
      (error) => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
        // this.isLoading = false;
      }
    );
  }


  @Output() showChannel = new EventEmitter<void>(); // Ereignis zum Einblenden der Thread-Komponente

  @Input()
  isChannelVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  @Input()
  isNewMessageVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  @Input()
  isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

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
