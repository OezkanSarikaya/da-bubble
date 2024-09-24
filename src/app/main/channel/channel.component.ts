import { Component } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [ChatmsgboxComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  isThreadOpen = true;
  openThread() {
    alert('Ich möchte die Thread Section einlenden!');
    this.isThreadOpen = false;
    
  }
}
