import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule, JsonPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { hideThreadComponent } from '../../state/actions/triggerComponents.actions';
import { ChannelService } from '../../services/channel.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';

export interface ThreadMessage {
  userName: string;
  content: string;
  createdAt?: Date; // O el tipo de fecha que uses
  createdAtString: string,
  time: string
  // Agrega aquí otras propiedades según tu estructura de mensajes
}
@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ChatmsgboxComponent,CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  threadsArray = [1, 2]

  messages: any[] = [];
  private subscription: Subscription = new Subscription();
  
  private threadIDSubject = new BehaviorSubject<string | null>(null);  // Crear BehaviorSubject
  threadID$: Observable<string | null> = this.threadIDSubject.asObservable();
  
  private threadsArraySubject = new BehaviorSubject<ThreadMessage[]>([]);  // Crear BehaviorSubject
  threadsArray$: Observable<ThreadMessage[]> = this.threadsArraySubject.asObservable();
  
  constructor(private store: Store, private channelService: ChannelService){}

  ngOnInit(): void {
    this.store.select(selectThreadSelector).subscribe(async (threadID) => {
      this.threadIDSubject.next(threadID);
      if (threadID) {
        // let infoThread = await this.channelService.loadThreadMessages(threadID);
        // console.log(infoThread);
        // // this.threadsArraySubject.next(infoThread)
     
        this.channelService.loadThreadMessages(threadID);


        // this.channelService.messagesUpdated.subscribe((messages) => {
        //   this.messages = messages;
        //   console.log("Mensajes actualizados:", this.messages);
        // });
      }
      this.threadsArray$.subscribe(val => {
        console.log(val);
      })
    });
  }

  @Input()
  isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  // Methode zum Ausblenden der Thread-Komponente
  hide() {
    this.store.dispatch(hideThreadComponent()) // Sendet das Ereignis an die Eltern-Komponente
  }

}
