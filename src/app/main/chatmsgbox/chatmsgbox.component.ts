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
import { ChannelDependenciesService } from '../../services/channel-dependencies.service';
import { User } from '../../interfaces/user';

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
  chatWith!: User;

  
  constructor(private channelService: ChannelService, private store: Store, private userService: UserService, public channelDependenciesService: ChannelDependenciesService,){ 
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
    const sub7 = this.channelDependenciesService.chatWith$.subscribe(user => {
      this.chatWith = user;
    });
    this.subscription.add(sub1);
    this.subscription.add(sub2);
    this.subscription.add(sub3);
    this.subscription.add(sub4);
    this.subscription.add(sub5);
    this.subscription.add(sub6);
    this.subscription.add(sub7);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  addEmoji(emoji: string, textarea: HTMLTextAreaElement) {

    if (!textarea) return;

    // Holen der aktuellen Cursor-Position
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const textAfterCursor = textarea.value.substring(cursorPos);

    // Aktualisiere den Inhalt des Textareas
    textarea.value = textBeforeCursor + emoji + textAfterCursor;

    // Setze den Cursor nach dem eingefügten Emoji
    textarea.selectionStart = textarea.selectionEnd = cursorPos + emoji.length;

    // Fokussiere das Textarea erneut
    textarea.focus();
  }
  
  async sendMessage(){
    if(this.isChannel(this.context)){
      if(!this.isEditngMessageChannel()){
        if(this.content().trim() === '') return
        //Create
        if(this.selectedChannel()){
          const channelID = this.selectedChannel()!.id
          this.channelDependenciesService.createMessage(this.content(), this.currentUser.idFirebase, 'messages', channelID);
        }
      }else{
        this.channelService.updateMessageContent(this.editMessageChannel()!, this.content())
      }
    }else if(this.isThread(this.context)){
      if(!this.isEditngMessageThread()){
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

  isChannel(context: 'channel' | 'thread'){
    return context === 'channel'
  }

  isThread(context: 'channel' | 'thread'){
    return context === 'thread'
  }

  isEditngMessageChannel(){
    return this.editMessageChannel();
  }

  isEditngMessageThread(){
    return this.editMessageThread();
  }

}
