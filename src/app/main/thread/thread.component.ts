import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule, JsonPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { hideThreadComponent } from '../../state/actions/triggerComponents.actions';
import { ChannelService } from '../../services/channel.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';
import { UserService } from '../../services/user.service';

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
  
  constructor(private store: Store, private channelService: ChannelService, private userService: UserService){}

  ngOnInit(): void {
    const sub3 = this.store.select(selectThreadSelector).subscribe(async (thread) => {
      console.log(thread);
      this.threadHeadSubject.next(thread);
      this.threadHead$.subscribe(val=>{
        this.threadInitial = val;
      })
      let threadID = thread?.msg.threadID;
      this.threadIDSubject.next(threadID);
      if (threadID) {     
        this.channelService.loadThreadMessages(threadID);
        const sub1 = this.channelService.getthreadMessagesUpdated().subscribe(val =>{
          console.log(val);
          this.messagesSubject.next(val)
        })
        this.subscription.add(sub1);
      }
      const sub2 = this.userService.currentUser$.subscribe(user => {
        this.currentUser = user;          
      });
      this.subscription.add(sub2);
    });
    this.subscription.add(sub3);
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
