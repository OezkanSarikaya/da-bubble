import {
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';

import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  editMessageChannelOpen,
  editMessageThreadOpen,
  hideThreadComponent,
  showThreadComponent,
} from '../../state/actions/triggerComponents.actions';
import {
  selectSelectedChannelSelector,
  selectThreadSelector,
  triggerChannelSelector,
  triggerNewMessageSelector,
} from '../../state/selectors/triggerComponents.selectors';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel';
import { user } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';
import { Message } from '../../interfaces/message';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../interfaces/user';
import { ChannelDependenciesService } from '../../services/channel-dependencies.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ShowReactionsComponent } from '../show-reactions/show-reactions.component';
import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';

interface ChannelAllData {
  userName?: string;
  messages?: any[]; // Si tienes un tipo específico para los mensajes, reemplaza {} con ese tipo.
}

@Injectable({
  providedIn: 'root',
})

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    ChatmsgboxComponent,
    CommonModule,
    FormsModule,
    ShowReactionsComponent,
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
})
export class ChannelComponent {
  isChannelInfoOpen = false;
  isChannelMembersOpen = false;
  isAddChannelMembersOpen = false;
  isBackdropVisible = false;
  private subscription: Subscription = new Subscription();

  hoveredReaction: any | null = null; // Die Reaktion, die aktuell gehovt wird
  popupPosition = { x: 0, y: 0 }; // Position des Popups

  @Input()
  isNewMessageVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  @Input()
  isChannelVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  // @Input()
  // isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit
  currentUser: Signal<any> = signal<any>(null);
  isChannelSelected$: Observable<boolean> = new Observable();
  isNewMessageVisible$: Observable<boolean> = new Observable();
  selectedChannel = signal<Channel | null>(null);
  channelObserved = signal<Channel | null>(null);
  contentChannel = signal<string>('');
  nameChannelSignal = computed(() => this.channelObserved()?.name ?? '');
  currentDate: string = '';
  namePerson: WritableSignal<string> = signal<string>('');
  persons: any[] = [];
  searchedPersons: WritableSignal<User[]> = signal<User[]>([]);
  userEmpty: User = {
    avatar: '',
    email: '',
    fullName: '',
    id: '',
    status: '',
    uid: '',
  };
  personSelectedForChannel: WritableSignal<User> = signal<User>(this.userEmpty);
  lastAnswer = signal<string>('');
  editChannelTitleTrigger = signal<boolean>(false);
  channelNameModel: string = '';

  constructor(
    private store: Store,
    private channelService: ChannelService,
    private userService: UserService,
    public channelDependenciesService: ChannelDependenciesService,
    private firestore: Firestore
  ) {
    setInterval(() => {
      let timestamp = this.channelService.getTodayDate();
      this.currentDate = this.channelService.getFormattedDate(timestamp);
    }, 1000);
    this.currentUser = toSignal(this.userService.currentUser$);
    console.log(this.currentUser());

    effect(() => {
      if (this.selectedChannel()) {
        console.log(this.selectedChannel());
        console.log('ChannelObserved Updated:', this.channelObserved());
        console.log(this.searchedPersons());
        console.log(this.namePerson());
        console.log(this.lastAnswer());
        console.log(this.editChannelTitleTrigger());
        this.personSelectedForChannel();
        this.channelNameModel = this.channelObserved()?.name ?? '';
      }
    });
  }

  ngOnInit(): void {
    this.isChannelSelected$ = this.store.select(triggerChannelSelector);
    this.isNewMessageVisible$ = this.store.select(triggerNewMessageSelector);
    const sub1 = this.store
      .select(selectSelectedChannelSelector)
      .subscribe(async (channel) => {
        if (channel) {
          this.selectedChannel.set(channel);
          this.channelService
            .observeChannel(channel.id)
            .subscribe((updatedChannel) => {
              this.channelObserved.set(updatedChannel);
              if (updatedChannel.messages && updatedChannel.messages.length > 0) {
                this.updateChannelMessage(updatedChannel)
              }
            });
        }
      });
    const sub3 = this.channelService.contentEditChannel$.subscribe(
      (content) => {
        this.contentChannel.set(content);
      }
    );
    const sub4 = this.userService.getUsers().subscribe((users) => {
      this.persons = users;
    });
    this.subscription.add(sub1);
    this.subscription.add(sub3);
    this.subscription.add(sub4);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * This function verify first if a message exist and this one has an id
   * If a message has a thread search for the last Thread and asign in this message whre the Threads is the time of creation of the thread
   * @param updatedChannel That is the Channel that will updated. The opened Channel
   */
  updateChannelMessage(updatedChannel: Channel){
    updatedChannel.messages.forEach((message) => {
      if (message && message.id) {
        this.channelService
          .observeLastThreadTimeFromMessage(message.id)
          .subscribe((lastThreadTime) => {
            if (lastThreadTime) {
              const updatedMessage = {
                ...message, 
                lastThreadTime: lastThreadTime, 
              };
              const index = updatedChannel.messages.findIndex(
                (msg) => msg.id === message.id
              );
              if (index !== -1) {
                updatedChannel.messages[index] = updatedMessage;
              }
            }
          });
      } else {
        console.log(
          'We dont have anything here to show for',
          message
        );
      }
    });
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

  // Methode, die das Einblenden auslöst
  onShowThread(message: Message) {
    this.store.dispatch(showThreadComponent({ message }));
  }

  async editMessageChannel(messageID: string) {
    let content = await this.channelService.getMessageContentById(messageID);
    this.channelService.setContentChannel(content);
    this.channelService.setContext('channel');
    this.store.dispatch(editMessageChannelOpen({ messageID }));
  }

  toggleChannelMembers() {
    if (!this.isChannelMembersOpen) {
      // Backdrop wird angezeigt
      this.isBackdropVisible = true;
      // Kleines Timeout, um das Display: none aufzuheben, bevor die Opacity-Animation startet
      setTimeout(() => {
        this.isChannelMembersOpen = true;
        document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
      }, 10);
    } else {
      // Blende den Backdrop aus
      this.isChannelMembersOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
      setTimeout(() => {
        this.isBackdropVisible = false;
        document.body.classList.remove('no-scroll');
      }, 300); // Dauer der CSS-Transition (300ms)
    }
  }

  openAddChannelMembers() {
    this.isChannelMembersOpen = false;
    if (!this.isAddChannelMembersOpen) {
      // Backdrop wird angezeigt
      this.isBackdropVisible = true;
      // Kleines Timeout, um das Display: none aufzuheben, bevor die Opacity-Animation startet
      setTimeout(() => {
        this.isAddChannelMembersOpen = true;
        document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
      }, 10);
    } else {
      // Blende den Backdrop aus
      this.isAddChannelMembersOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
      setTimeout(() => {
        this.isBackdropVisible = false;
        document.body.classList.remove('no-scroll');
      }, 300); // Dauer der CSS-Transition (300ms)
    }
  }

  closePopup() {    
    if (this.isChannelInfoOpen) {
      this.isChannelInfoOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
    }

    if (this.isChannelMembersOpen) {
      this.isChannelMembersOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
    }

    if (this.isAddChannelMembersOpen) {
      this.isAddChannelMembersOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
    }
    setTimeout(() => {
      this.isBackdropVisible = false;
      document.body.classList.remove('no-scroll');
    }, 300); // Dauer der CSS-Transition (300ms)
    
  }

  toggleChannelInfo() {
    if (!this.isChannelInfoOpen) {
      // Backdrop wird angezeigt
      this.isBackdropVisible = true;
      // Kleines Timeout, um das Display: none aufzuheben, bevor die Opacity-Animation startet
      setTimeout(() => {
        this.isChannelInfoOpen = true;
        document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
      }, 10);
    } else {
      // Blende den Backdrop aus
      this.isChannelInfoOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
      setTimeout(() => {
        this.isBackdropVisible = false;
        document.body.classList.remove('no-scroll');
      }, 300); // Dauer der CSS-Transition (300ms)
    }
    if(this.editChannelTitleTrigger()){
      this.editTitleChannel();
    }
  }

  async deleteMessage(messageId: string, channelID: string) {
    await this.channelService.deleteMessageChannel(messageId, channelID);
  }

  addPerson() {
    this.channelDependenciesService.addUserToChannel(
      this.selectedChannel()!.id,
      this.personSelectedForChannel().id
    );
    this.deletePersonSelectedToChannel();
    this.closePopup();
  }

  searchPerson() {
    if (this.namePerson() !== '') {
      this.channelService
        .searchPerson(
          this.namePerson(),
          this.persons,
          this.channelObserved()!.members
        )
        .subscribe((users) => {
          this.searchedPersons.set(users);
        });
    } else {
      this.closeSearch();
    }
  }

  public closeSearch() {
    this.searchedPersons.set([]);
    this.namePerson.set('');
  }

  addPersonSelectedToChannel(user: User) {
    this.personSelectedForChannel.set(user);
    this.closeSearch();
  }

  deletePersonSelectedToChannel() {
    this.personSelectedForChannel.set(this.userEmpty);
  }

  leaveAChannel() {
    this.channelDependenciesService.removeMemberFromChannel(
      this.selectedChannel()!.id,
      this.currentUser().idFirebase
    );
  }

  editTitleChannel(){
    this.editChannelTitleTrigger.set(!this.editChannelTitleTrigger())
  }

  updateChannelSignal(value: string): void {
    this.channelNameModel = value; 
  }

  saveNameChannel(){
    console.log(this.channelNameModel);
    this.editTitleChannel()
  }

}
