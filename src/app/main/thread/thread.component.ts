import { Component, effect, EventEmitter, Input, Output, signal, Signal } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule, JsonPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { editMessageThreadOpen, hideThreadComponent } from '../../state/actions/triggerComponents.actions';
import { ChannelService } from '../../services/channel.service';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { selectSelectedChannelSelector, selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';
import { UserService } from '../../services/user.service';
import { Channel } from '../../interfaces/channel';
import { Message } from '../../interfaces/message';
import { ThreadMessage } from '../../interfaces/threadMessage';

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
  selectedThread = signal<Message | null>(null);
  threadObserved = signal<ThreadMessage | null>(null)
  selectedChannel = signal<Channel | null>(null)
  channelObserved = signal<Channel | null>(null)
  contentThread = signal<string>('');
  @Input() isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit
 
    
  constructor(private store: Store, private channelService: ChannelService, private userService: UserService){
    effect(()=>{
      console.log(this.selectedThread());
      console.log(this.threadObserved());
      this.selectedChannel()
    })
  }

  ngOnInit(): void {
    const sub1 = this.store.select(selectThreadSelector).subscribe(async (thread) => {
      if (thread) {
        this.selectedThread.set(thread);
      }
    });
    
    if(this.selectedThread()?.id){
      console.log(this.selectedThread()!.id);
      const sub2 =  this.channelService.observeThread(this.selectedThread()!.id).subscribe((updatedThread) => {
        console.log('thread observado emitido:', updatedThread); 
        this.threadObserved.set(updatedThread);
      });
      this.subscription.add(sub2)
    }
    const sub3 = this.store.select(selectSelectedChannelSelector).subscribe(async (channel) => {
      if (channel) {
        this.selectedChannel.set(channel);
        this.channelService.observeChannel(channel.id).subscribe((updatedChannel) => {
          console.log('Canal observado emitido:', updatedChannel); 
          this.channelObserved.set(updatedChannel);
        });
      }
    });
    
    const sub4 = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;        
    });
    const sub5 = this.channelService.contentEditThread$.subscribe(content =>{
      this.contentThread.set(content)
    })
    this.subscription.add(sub1);
    this.subscription.add(sub3);
    this.subscription.add(sub4);
    this.subscription.add(sub5);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async editMessageThread(messageID: string){
    let content = await this.channelService.getMessageContentById(messageID);
    this.channelService.setContentThread(content);
    this.channelService.setContext('thread');
    this.store.dispatch(editMessageThreadOpen({messageID}));
  }

  // Methode zum Ausblenden der Thread-Komponente
  hide() {
    this.store.dispatch(hideThreadComponent()) // Sendet das Ereignis an die Eltern-Komponente
  }

}
