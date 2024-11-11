import { Component, computed, effect, EventEmitter, Input, Output, signal, Signal } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { showThreadComponent } from '../../state/actions/triggerComponents.actions';
import { selectSelectedChannelSelector, triggerChannelSelector, triggerNewMessageSelector } from '../../state/selectors/triggerComponents.selectors';
import { forkJoin, Observable } from 'rxjs';
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
      
  constructor(private store: Store, private channelService: ChannelService, private userService: UserService){
    effect(()=>{
      if(this.selectedChannel()){
        // console.log(this.selectedChannel());
        console.log('Canal observado actualizado:', this.channelObserved());
      }
      
    })
  }

  ngOnInit(): void {
    this.isChannelSelected$ = this.store.select(triggerChannelSelector);
    this.isNewMessageVisible$ = this.store.select(triggerNewMessageSelector);
    this.store.select(selectSelectedChannelSelector).subscribe(async (channel) => {
      if (channel) {
        this.selectedChannel.set(channel);
        this.channelService.observeChannel(channel.id).subscribe((updatedChannel) => {
          console.log('Canal observado emitido:', updatedChannel); 
          this.channelObserved.set(updatedChannel);
        });
      }
    });
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;        
    });
  }

   
  // Methode, die das Einblenden auslöst
  onShowThread(message: Message) {
    this.store.dispatch(showThreadComponent({message}))
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
