import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ChannelComponent } from './channel/channel.component';
import { ThreadComponent } from './thread/thread.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    HeaderComponent,
    WorkspaceComponent,
    ChannelComponent,
    ThreadComponent,
    CommonModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  // Zustand, ob die Thread-Komponente sichtbar ist
  isThreadVisible: boolean = false;
  isChannelSelected: boolean = false;
  isNewMessageOpen = false;

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
