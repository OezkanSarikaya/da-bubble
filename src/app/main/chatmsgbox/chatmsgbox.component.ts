import { Component, effect, ElementRef, Input, input, signal, Signal, SimpleChanges, viewChild } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { ChannelService } from '../../services/channel.service';
import { selectSelectedChannelSelector, selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Message } from '../../interfaces/message';

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
  @Input() context: 'channel' | 'thread' = 'channel';

  constructor(private channelService: ChannelService, private store: Store, private userService: UserService){ 
    effect(() => {
      //  console.log(this.selectedChannel());
       this.selectedChannel()
       console.log(this.selectedThread());
    });
  }

  ngOnInit(): void {
    this.store.select(selectSelectedChannelSelector).subscribe(async (channel) => {
      if (channel) {
        this.selectedChannel.set(channel);
      }
    });
    this.store.select(selectThreadSelector).subscribe(async (thread) => {
      if (thread) {
        this.selectedThread.set(thread);
      }
    });
    this.userService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;      
    });
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
