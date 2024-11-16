import { Component, computed, effect, Input, Signal, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { ChannelService } from '../../services/channel.service';
import { editMessageChannelSelector, editMessageThreadSelector, selectSelectedChannelSelector, selectThreadSelector } from '../../state/selectors/triggerComponents.selectors';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Message } from '../../interfaces/message';
import { Observable, Subscription } from 'rxjs';
import { editMessageChannelClose, editMessageThreadClose } from '../../state/actions/triggerComponents.actions';

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
  editMessageThread = signal<string | null>(null);
  private subscription: Subscription = new Subscription();
  editMessageThread$: Observable<boolean> = new Observable()
  @Input() context: 'channel' | 'thread' = 'channel';
  @Input() content!: WritableSignal<string>;
  @Input() nameChannel!: Signal<string>;
  editingContext!: string;

  
  constructor(private channelService: ChannelService, private store: Store, private userService: UserService){ 
    effect(() => {
      //  console.log(this.selectedChannel());
       this.selectedChannel()
       this.selectedThread()
      //  console.log(this.selectedThread());
      //  this.nameChannel;       
    });
    effect(()=>{
      // console.log(this.editMessageChannel());
      // console.log(this.editMessageThread());
      // console.log('Contenido actualizado en context:', this.context);
      this.editMessageChannel()
      this.editMessageThread()
      this.content;
      this.context;
    })
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
    const sub5 = this.store.select(editMessageThreadSelector).subscribe(async (messageID) => {
        this.editMessageThread.set(messageID);
    });
    const sub6 = this.channelService.context$.subscribe(val=>{
      this.editingContext = val;
      console.log(val);
    })
      
    this.subscription.add(sub1);
    this.subscription.add(sub2);
    this.subscription.add(sub3);
    this.subscription.add(sub4);
    this.subscription.add(sub5);
    this.subscription.add(sub6);
  
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  async sendMessage(){
    if(this.context === 'channel'){
      if(!this.editMessageChannel()){
        if(this.content().trim() === '') return
        //Create
        if(this.selectedChannel()){
          const channelID = this.selectedChannel()!.id
          this.channelService.createMessage(this.content(), this.currentUser.idFirebase, 'messages', channelID);
        }
      }else{
        this.channelService.updateMessageContent(this.editMessageChannel()!, this.content())
      }
    }else if(this.context === 'thread'){
      if(!this.editMessageThread()){
        if(this.content().trim() === '') return
        //Create
        if(this.selectedThread()){
          this.channelService.createThreadedMessage(this.content(), this.currentUser.idFirebase, 'messages', this.selectedThread()!.id)
        }
      }else{
        console.log('edit');
        this.channelService.updateMessageContent(this.editMessageThread()!, this.content())
      }
    }
    this.cancelEdit()
  }

  cancelEdit(){
    this.content.set('');
    this.store.dispatch(editMessageChannelClose());
    this.store.dispatch(editMessageThreadClose());
    this.channelService.setContext('');
  }


}
