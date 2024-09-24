import { Component, EventEmitter, Output } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [ChatmsgboxComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  @Output() showThread = new EventEmitter<void>(); // Ereignis zum Einblenden der Thread-Komponente

  // Methode, die das Einblenden auslöst
  onShowThread() {
    this.showThread.emit();
  }
}
