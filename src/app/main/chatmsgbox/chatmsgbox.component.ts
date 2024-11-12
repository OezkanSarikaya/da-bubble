import { Component, effect, Input, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { ChannelService } from '../../services/channel.service';
import { editMessageChannelSelector, selectSelectedChannelSelector, selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Message } from '../../interfaces/message';
import { Observable, Subscription } from 'rxjs';
import { editMessageChannelClose } from '../../state/actions/triggerComponents.actions';

@Component({
  selector: 'app-chatmsgbox',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chatmsgbox.component.html',
  styleUrl: './chatmsgbox.component.scss'
})
export class ChatmsgboxComponent {
  currentUser: any = null;
  selectedChannel = signal<Channel | null>(null);
  selectedThread = signal<Message | null>(null);
  editMessageChannel = signal<string | null>(null);
  private subscription: Subscription = new Subscription();
  editMessageThread$: Observable<boolean> = new Observable()
  @Input() context: 'channel' | 'thread' = 'channel';

  @Input() contentSignal = ''
  content: WritableSignal<string> = signal(this.contentSignal);

  

  constructor(private channelService: ChannelService, private store: Store, private userService: UserService){ 
    effect(() => {
      //  console.log(this.selectedChannel());
       this.selectedChannel()
       console.log(this.selectedThread());
       console.log(this.editMessageChannel());
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contentSignal']) {
      this.content.set(this.contentSignal);
    }
  }

  ngOnInit(): void {
    const sub1 = this.store.select(selectSelectedChannelSelector).subscribe(async (channel) => {
      if (channel) {
        this.selectedChannel.set(channel);
      }
    });
    const sub2 = this.store.select(selectThreadSelector).subscribe(async (thread) => {
      if (thread) {
        this.selectedThread.set(thread);
      }
    });
    const sub3 = this.userService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;      
    });
    const sub4 = this.store.select(editMessageChannelSelector).subscribe(async (messageID) => {
        this.editMessageChannel.set(messageID);
    });
    
    this.subscription.add(sub1);
    this.subscription.add(sub2);
    this.subscription.add(sub3);
    this.subscription.add(sub4);
  
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  sendMessage(){
    if(this.context === 'channel'){
      if(!this.editMessageChannel()){
        if(this.selectedChannel()){
          const channelID = this.selectedChannel()!.id
          this.channelService.createMessage(this.content(), this.currentUser.idFirebase, 'messages', channelID);
        }
      }else{
        this.channelService.updateMessageContent(this.editMessageChannel()!, this.content())
      }
    }else{
      if(this.selectedThread()){
        this.channelService.createThreadedMessage(this.content(), this.currentUser.idFirebase, 'messages', this.selectedThread()!.id)
      }
    }
    this.store.dispatch(editMessageChannelClose());
    this.content.set('');
  }

  cancelEdit(){
    this.store.dispatch(editMessageChannelClose());
    this.content.set('');
  }

}
