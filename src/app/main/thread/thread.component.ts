import { Component, effect, EventEmitter, Input, Output, Signal } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule, JsonPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { hideThreadComponent } from '../../state/actions/triggerComponents.actions';
import { ChannelService } from '../../services/channel.service';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { selectSelectedChannelSelector, selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';
import { UserService } from '../../services/user.service';
import { Channel } from '../../interfaces/channel';

export interface ThreadMessage {
  userName: string;
  content: string;
  createdAt?: Date; // O el tipo de fecha que uses
  createdAtString: string;
  time: string
}
export interface ThreadMessageHead {
  avatarUrl: string,
  msg: {
  content: string;
  createdAt?: Date; // O el tipo de fecha que uses
  createdAtString: string;
  fullName: string,
  id: string;
  senderID: string,
  threadCount: number;
  ThreadID: string;
  time: string
  }
}

export interface channelData {
  createdAt?: Date; // O el tipo de fecha que uses
  createdBy: string;
  description: string;
  id: string;
  name: string;
  members: [];
  messageIds: []; 
}
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
  messagesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  message$: Observable<any[]> = this.messagesSubject.asObservable();

  threadInitial: ThreadMessageHead = {
    avatarUrl: '',
    msg:{
    content: '',
    createdAt: new Date(),// O el tipo de fecha que uses
    createdAtString: '',
    fullName: '',
    id: '',
    senderID: '',
    threadCount: 0,
    ThreadID: '',
    time: ''
    }
  }


  threadHeadSubject: BehaviorSubject<ThreadMessageHead> = new BehaviorSubject<ThreadMessageHead>(this.threadInitial);
  threadHead$: Observable<ThreadMessageHead> = this.threadHeadSubject.asObservable();

  
  private threadIDSubject = new BehaviorSubject<string | null>(null);  // Crear BehaviorSubject
  threadID$: Observable<string | null> = this.threadIDSubject.asObservable();
  
  private threadsArraySubject = new BehaviorSubject<ThreadMessage[]>([]);  // Crear BehaviorSubject
  threadsArray$: Observable<ThreadMessage[]> = this.threadsArraySubject.asObservable();

  // channelData$: Observable<Channel> = new Observable();
  selectedChannel: Signal<Channel | null> = this.channelService.selectedChannel;
    
  constructor(private store: Store, private channelService: ChannelService, private userService: UserService){
    effect(() => {
      const channel = this.selectedChannel();
      if (channel) {
        console.log("Datos del canal actualizados:", channel);
      }
    });
  }

  ngOnInit(): void {
    const sub3 = this.store.select(selectThreadSelector).subscribe(async (thread) => {
      // console.log(thread);
      this.threadHeadSubject.next(thread);
      this.threadHead$.subscribe(val=>{this.threadInitial = val})
      let threadID = thread?.msg.threadID;
      this.threadIDSubject.next(threadID);
      if (threadID) {     
        this.channelService.loadThreadMessages(threadID);
        const sub1 = this.channelService.getthreadMessagesUpdated()
        .pipe(map(threads => threads.sort((a, b) => a.createdAt - b.createdAt)))
        .subscribe(val =>{this.messagesSubject.next(val)})
        this.subscription.add(sub1);
      }
      const sub2 = this.userService.currentUser$.subscribe(user => {this.currentUser = user});
      this.subscription.add(sub2);
    });
    this.subscription.add(sub3);
    // this.channelData$ = this.store.select(selectSelectedChannelSelector);
    // this.channelData$.subscribe(val=>{
    //   console.log(val);
    // })
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
