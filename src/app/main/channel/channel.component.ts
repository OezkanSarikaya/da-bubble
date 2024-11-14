import { Component, computed, effect, EventEmitter, Input, Output, signal, Signal } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { editMessageChannelOpen, editMessageThreadOpen, hideThreadComponent, showThreadComponent } from '../../state/actions/triggerComponents.actions';
import { selectSelectedChannelSelector, selectThreadSelector, triggerChannelSelector, triggerNewMessageSelector } from '../../state/selectors/triggerComponents.selectors';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel';
import { user } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';
import { Message } from '../../interfaces/message';


interface ChannelAllData {
  userName?: string;
  messages?: any[]; // Si tienes un tipo específico para los mensajes, reemplaza {} con ese tipo.
}

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [ChatmsgboxComponent, CommonModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
})
export class ChannelComponent {
  isChannelInfoOpen = false;
  isChannelMembersOpen = false;
  isAddChannelMembersOpen = false;
  isBackdropVisible = false;
  private subscription: Subscription = new Subscription();

  @Input()
  isNewMessageVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  @Input()
  isChannelVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  // @Input()
  // isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit
  currentUser: any = null;
  isChannelSelected$: Observable<boolean> = new Observable();
  isNewMessageVisible$: Observable<boolean> = new Observable();
  selectedChannel = signal<Channel | null>(null);
  channelObserved = signal<Channel | null>(null)
  contentChannel = signal<string>('');
  nameChannelSignal = computed(() => this.channelObserved()?.name ?? '');
      
  constructor(private store: Store, private channelService: ChannelService, private userService: UserService){
    effect(()=>{
      if(this.selectedChannel()){
        console.log(this.selectedChannel());
        console.log('Canal observado actualizado:', this.channelObserved());
      }
    })
  }

  ngOnInit(): void {
    this.isChannelSelected$ = this.store.select(triggerChannelSelector);
    this.isNewMessageVisible$ = this.store.select(triggerNewMessageSelector);
    const sub1 = this.store.select(selectSelectedChannelSelector).subscribe(async (channel) => {
      if (channel) {
        this.selectedChannel.set(channel);
        this.channelService.observeChannel(channel.id).subscribe((updatedChannel) => {
          console.log('Canal observado emitido:', updatedChannel); 
          this.channelObserved.set(updatedChannel);
        });
      }
    });
    const sub2 = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;        
    });
    const sub3 = this.channelService.contentEditChannel$.subscribe(content =>{
      this.contentChannel.set(content)
    })

    this.subscription.add(sub1);
    this.subscription.add(sub2);
    this.subscription.add(sub3);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();    
  }

  // Methode, die das Einblenden auslöst
  onShowThread(message: Message) {
    this.store.dispatch(showThreadComponent({ message }));
  }

  async editMessageChannel(messageID: string){
    let content = await this.channelService.getMessageContentById(messageID);
    this.channelService.setContentChannel(content);
    this.channelService.setContext('channel');
    this.store.dispatch(editMessageChannelOpen({messageID}));
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
  }

  async deleteMessage(messageId: string, channelID: string){
    this.store.dispatch(hideThreadComponent());
    setTimeout(async() => {
      await this.channelService.deleteMessage(messageId, channelID)
    }, 0);
  }

}
