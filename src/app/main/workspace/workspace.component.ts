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
  isChannelOpen = true;
  isPrivateMessageOpen = true;
  togglePrivateMessage() {
    this.isPrivateMessageOpen = !this.isPrivateMessageOpen;
  }

  toggleChannels() {
    this.isChannelOpen = !this.isChannelOpen;
  }
}
