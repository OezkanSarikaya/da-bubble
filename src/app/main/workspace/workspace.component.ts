import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule,SearchComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  isCreateChannelOpen = false;
  isChannelOpen = true;
  isPrivateMessageOpen = true;
  isWorkspaceOpen = true;
  isAddChannelOpen = false;
  isBackdropVisible: boolean = false;

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
      }, 300);  // Dauer der CSS-Transition (300ms)
    }
  }
}
