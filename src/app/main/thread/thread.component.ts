import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ChatmsgboxComponent,CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  @Input()
  isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit
  @Output() hideThread = new EventEmitter<void>(); // Gibt das Ausblenden nach außen

  // Methode zum Ausblenden der Thread-Komponente
  hide() {
    this.hideThread.emit(); // Sendet das Ereignis an die Eltern-Komponente
  }


}
