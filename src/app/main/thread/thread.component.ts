import { Component, effect, EventEmitter, Input, Output, signal, Signal } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule, JsonPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { hideThreadComponent } from '../../state/actions/triggerComponents.actions';
import { ChannelService } from '../../services/channel.service';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { selectSelectedChannelSelector, selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';
import { UserService } from '../../services/user.service';
import { Channel } from '../../interfaces/channel';
import { Message } from '../../interfaces/message';
import { ThreadMessage } from '../../interfaces/threadMessage';

// export interface ThreadMessage {
//   userName: string;
//   content: string;
//   createdAt?: Date; // O el tipo de fecha que uses
//   createdAtString: string;
//   time: string
// }
// export interface ThreadMessageHead {
//   avatarUrl: string,
//   msg: {
//   content: string;
//   createdAt?: Date; // O el tipo de fecha que uses
//   createdAtString: string;
//   fullName: string,
//   id: string;
//   senderID: string,
//   threadCount: number;
//   ThreadID: string;
//   time: string
//   }
// }

// export interface channelData {
//   createdAt?: Date; // O el tipo de fecha que uses
//   createdBy: string;
//   description: string;
//   id: string;
//   name: string;
//   members: [];
//   messageIds: []; 
// }
@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ChatmsgboxComponent,CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  currentUser: any = null;
  private subscription: Subscription = new Subscription();
  // messagesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  // message$: Observable<any[]> = this.messagesSubject.asObservable();

  // threadInitial: ThreadMessageHead = {
  //   avatarUrl: '',
  //   msg:{
  //   content: '',
  //   createdAt: new Date(),// O el tipo de fecha que uses
  //   createdAtString: '',
  //   fullName: '',
  //   id: '',
  //   senderID: '',
  //   threadCount: 0,
  //   ThreadID: '',
  //   time: ''
  //   }
  // }

  selectedThread = signal<Message | null>(null);
  threadObserved = signal<ThreadMessage | null>(null)

    
  constructor(private store: Store, private channelService: ChannelService, private userService: UserService){
    effect(()=>{
      console.log(this.selectedThread());
      console.log(this.threadObserved());
    })
  }

  ngOnInit(): void {
    this.store.select(selectThreadSelector).subscribe(async (thread) => {
      if (thread) {
        this.selectedThread.set(thread);
      }
    });
    if(this.selectedThread()?.id){
      console.log(this.selectedThread()!.id);
      this.channelService.observeThread(this.selectedThread()!.id).subscribe((updatedThread) => {
        console.log('thread observado emitido:', updatedThread); 
        this.threadObserved.set(updatedThread);
      });
    }
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;        
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @Input()
  isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  // Methode zum Ausblenden der Thread-Komponente
  hide() {
    this.store.dispatch(hideThreadComponent()) // Sendet das Ereignis an die Eltern-Komponente
  }

}
