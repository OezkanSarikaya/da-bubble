import { Component, computed, effect, EventEmitter, Input, Output, signal, Signal } from '@angular/core';
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
import { ChannelDependenciesService } from '../../services/channel-dependencies.service';
import { ShowReactionsComponent } from '../show-reactions/show-reactions.component';
import { Firestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [ChatmsgboxComponent,CommonModule,ShowReactionsComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  currentUser: any = null;
  private subscription: Subscription = new Subscription();
  private threadSubscription = new Subscription(); 
  selectedThread = signal<Message | null>(null);
  threadObserved = signal<ThreadMessage | null>(null)
  selectedChannel = signal<Channel | null>(null)
  channelObserved = signal<Channel | null>(null)
  contentThread = signal<string>('');
  @Input() isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit
  nameChannelSignal = computed(() => this.channelObserved()?.name ?? '');
  currentDate: string = '';
  // currentUser: Signal<any> = signal<any>(null);
 
    
  constructor(private store: Store, private channelService: ChannelService, private userService: UserService, public channelDependenciesService: ChannelDependenciesService, private firestore: Firestore){
    this.currentUser = toSignal(this.userService.currentUser$);

    effect(()=>{
      console.log('SelectedThread',this.selectedThread());
      console.log('ThreadObserved',this.threadObserved());
      this.selectedChannel();
    })

    effect(() => {
      this.threadSubscription.unsubscribe();
      const selectedThread = this.selectedThread();
      if (selectedThread && selectedThread.id) {
        this.threadSubscription = this.channelService.observeThread(selectedThread.id).subscribe((updatedThread) => {
          this.threadObserved.set(updatedThread);
        });
      }
    });

    setInterval(()=>{
      let timestamp = this.channelService.getTodayDate();
      this.currentDate = this.channelService.getFormattedDate(timestamp);
    }, 1000)
  }

  ngOnInit(): void {
    const sub1 = this.store.select(selectThreadSelector).subscribe(async (thread) => {
      if (thread) {
        this.selectedThread.set(thread);
      }
    });
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
    this.threadSubscription.unsubscribe();
  }

  async addReaction(reactionIcon: string, messageId: string, userId: string, userName: string) {

    // console.log('addReaction: ',messageId,reactionIcon,userId,userName);
    
    try {
      const messageDocRef = doc(this.firestore, 'messages', messageId);
      const messageSnapshot = await getDoc(messageDocRef);

      if (!messageSnapshot.exists()) {
        console.error(`Message with ID ${messageId} not found.`);
        return;
      }

      const messageData = messageSnapshot.data();
      const reactions = messageData['reactions'] || [];
      // const msgID:string = '';

      // Check if the reaction type exists
      const reactionIndex = reactions.findIndex((r: any) => r.type === reactionIcon);

      if (reactionIndex === -1) {
        // Reaction type not found: Add new reaction
        const newReaction = {
          type: reactionIcon,
          users: [{ userId, userName }],
        };

        await updateDoc(messageDocRef, {
          reactions: arrayUnion(newReaction),
        });
      } else {
        // Reaction type exists: Check if the user has reacted
        const existingReaction = reactions[reactionIndex];
        const userIndex = existingReaction.users.findIndex((u: any) => u.userId === userId);

        if (userIndex === -1) {
          // User not found: Add user to the reaction
          existingReaction.users.push({ userId, userName });

          // Update the reactions array
          reactions[reactionIndex] = existingReaction;
          await updateDoc(messageDocRef, { reactions });
        } else {
          // User found: Remove the user from the reaction
          existingReaction.users = existingReaction.users.filter((u: any) => u.userId !== userId);

          if (existingReaction.users.length === 0) {
            // If no users remain, remove the reaction type entirely
            reactions.splice(reactionIndex, 1);
          } else {
            // Update the reactions array
            reactions[reactionIndex] = existingReaction;
          }

          await updateDoc(messageDocRef, { reactions });
        }
      }

      console.log('Reaction updated successfully.');
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
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

  async deleteMessage(messageID: string, parentMessageID: string){
    await this.channelService.deleteMessageThread(messageID, parentMessageID)
  }

}
