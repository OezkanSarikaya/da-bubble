import { Component, effect, Input, signal } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { ChannelService } from '../../services/channel.service';
import { selectSelectedChannelSelector, selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Message } from '../../interfaces/message';
import { Subscription } from 'rxjs';

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
  content: string = ''
  private subscription: Subscription = new Subscription();
  @Input() context: 'channel' | 'thread' = 'channel';

  constructor(private channelService: ChannelService, private store: Store, private userService: UserService){ 
    effect(() => {
      //  console.log(this.selectedChannel());
       this.selectedChannel()
       console.log(this.selectedThread());
    });
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
    this.subscription.add(sub1);
    this.subscription.add(sub2);
    this.subscription.add(sub3);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  sendMessage(){
    if(this.context === 'channel'){
      if(this.selectedChannel()){
        const channelID = this.selectedChannel()!.id
        this.channelService.createMessage(this.content, this.currentUser.idFirebase, 'messages', channelID);
      }
    }else{
      console.log('thread');
      if(this.selectedThread()){
        this.channelService.createThreadedMessage(this.content, this.currentUser.idFirebase, 'messages', this.selectedThread()!.id)
      }
    }
    this.content = '';
  }

}
