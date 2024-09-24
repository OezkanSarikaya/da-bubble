import { Component } from '@angular/core';
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
  isThreadOpen = true;
  toggleThread() {
    this.isThreadOpen = !this.isThreadOpen;
  }

}
