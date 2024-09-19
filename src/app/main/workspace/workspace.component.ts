import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
})
export class WorkspaceComponent {
  isChannelOpen = false;
  isPrivateMessageOpen = false;
  togglePrivateMessage() {
    this.isPrivateMessageOpen = !this.isPrivateMessageOpen;
  }

  toggleChannels() {
    this.isChannelOpen = !this.isChannelOpen;
  }
}
