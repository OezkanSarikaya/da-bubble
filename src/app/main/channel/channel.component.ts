import { Component, EventEmitter, Output } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [ChatmsgboxComponent,CommonModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  isChannelInfoOpen = false;
  isBackdropVisible = false;
  @Output() showThread = new EventEmitter<void>(); // Ereignis zum Einblenden der Thread-Komponente

  // Methode, die das Einblenden auslöst
  onShowThread() {
    this.showThread.emit();
  }

  toggleChannelInfo() {
    // this.isChannelInfoOpen = !this.isChannelInfoOpen;

    if (!this.isChannelInfoOpen) {
      // Backdrop wird angezeigt
      this.isBackdropVisible = true;
      // Kleines Timeout, um das Display: none aufzuheben, bevor die Opacity-Animation startet
      setTimeout(() => {
        this.isChannelInfoOpen = true;
        document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
      }, 10);
    } else {
      // Blende den Backdrop aus
      this.isChannelInfoOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
      setTimeout(() => {
        this.isBackdropVisible = false;
        document.body.classList.remove('no-scroll');
      }, 300);  // Dauer der CSS-Transition (300ms)
    }


  }
}
