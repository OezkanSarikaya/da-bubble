import { Component, computed, effect, EventEmitter, Input, Output, signal, Signal } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { showThreadComponent } from '../../state/actions/triggerComponents.actions';
import { selectSelectedChannelSelector, triggerChannelSelector, triggerNewMessageSelector } from '../../state/selectors/triggerComponents.selectors';
import { Observable } from 'rxjs';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel';
import { user } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';


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

  @Input()
  isNewMessageVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  @Input()
  isChannelVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit

  // @Input()
  // isVisible: boolean = true; // Empfängt den Zustand der Sichtbarkeit
  currentUser: any = null;
  isChannelSelected$: Observable<boolean> = new Observable();
  isNewMessageVisible$: Observable<boolean> = new Observable();
  // selectedChannel = signal<Channel | null>(null);
  channelAllData = signal<ChannelAllData>({}); 
  channelDataOrganized = computed(() => {
    const messages = this.channelAllData().messages || [];
    return messages.sort((a, b) => {
      return a.msg.createdAt.seconds - b.msg.createdAt.seconds; 
    });
  });
  selectedChannel: Signal<Channel | null> = this.channelService.selectedChannel;
  messageReferenz = computed(() => {
    const channel = this.selectedChannel();
    return channel ? { name: channel.name, idChannel: channel.id, userLoginId: this.currentUser.idFirebase } : {name: '', idChannel: '', userLoginId: ''};
  })
      
  constructor(private store: Store, private channelService: ChannelService, private userService: UserService){
    // this.channelService.messagesUpdated.subscribe((updatedMessages) => {
    //   this.channelAllData.set({ ...this.channelAllData(), messages: updatedMessages });
    // });  
    effect(() => {
      // console.log(this.selectedChannel());
      //  console.log(this.channelAllData());
      //  console.log(this.channelDataOrganized());
       this.selectedChannel();
       this.channelAllData();
       this.channelDataOrganized();
      });
  }

  ngOnInit(): void {
    this.isChannelSelected$ = this.store.select(triggerChannelSelector);
    this.isNewMessageVisible$ = this.store.select(triggerNewMessageSelector);
    this.store.select(selectSelectedChannelSelector).subscribe(async (channel) => {
      // this.selectedChannel.set(channel); 
     
    });
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;        
    });
  }

  // private async getChannelAllData(channel: Channel) {
  //   const {userName, messages} = await this.channelService.getChannelSelectedData(channel); // Obtiene el nombre del creador
  //   this.channelAllData.set({ userName, messages }); // Actualiza el signal con el nombre del creador
  //   console.log(this.channelAllData());
  // }

  // Methode, die das Einblenden auslöst
  onShowThread(thread: any) {
    this.store.dispatch(showThreadComponent({thread}))
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

}
