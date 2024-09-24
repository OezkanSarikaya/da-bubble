import { Component } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ChatmsgboxComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}
