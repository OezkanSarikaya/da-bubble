import { Component, effect, EventEmitter, Input, Output, signal, Signal } from '@angular/core';
import { ChatmsgboxComponent } from '../chatmsgbox/chatmsgbox.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { showThreadComponent } from '../../state/actions/triggerComponents.actions';
import { selectSelectedChannelSelector, triggerChannelSelector, triggerNewMessageSelector } from '../../state/selectors/triggerComponents.selectors';
import { Observable } from 'rxjs';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel';

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

  isChannelSelected$: Observable<boolean> = new Observable();
  isNewMessageVisible$: Observable<boolean> = new Observable();
  selectedChannel = signal<Channel | null>(null);
  channelAllData = signal<{ creatorName?: string }>({});
    
  constructor(private store: Store, private channelService: ChannelService){
      effect(() => {
       console.log(this.selectedChannel());
      });
  }

  ngOnInit(): void {
    this.isChannelSelected$ = this.store.select(triggerChannelSelector);
    this.isNewMessageVisible$ = this.store.select(triggerNewMessageSelector);
    this.store.select(selectSelectedChannelSelector).subscribe(async (channel) => {
      this.selectedChannel.set(channel); 
      if (channel) {
        await this.getChannelAllData(channel); // Asegúrate de que el canal no sea nulo
      }
    });
    // this.getChannelAllData()
  }

  private async getChannelAllData(channel: Channel) {
    const creatorName = await this.channelService.getChannelSelectedData(channel); // Obtiene el nombre del creador
    this.channelAllData.set({ creatorName }); // Actualiza el signal con el nombre del creador
    console.log(creatorName);
  }

  // async getChannelAllData(channel: Channel){
  //   const channelData = await this.channelService.getChannelSelectedData(channel);
  //   // Almacena el resultado en el signal
  //   this.channelAllData.set(channelData);
  // }

  // Methode, die das Einblenden auslöst
  onShowThread() {
    this.store.dispatch(showThreadComponent())
  }

  toggleChannelMembers() {
    // this.isChannelInfoOpen = !this.isChannelInfoOpen;

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
    // this.closePopup();
    this.isChannelMembersOpen = false;
    // this.isChannelInfoOpen = !this.isChannelInfoOpen;

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

    
    // this.isChannelMembersOpen
  }

  toggleChannelInfo() {
    // this.isChannelInfoOpen = !this.isChannelInfoOpen;

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
