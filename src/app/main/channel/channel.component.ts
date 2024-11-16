import { Component, computed, effect, EventEmitter, Input, Output, signal, Signal, WritableSignal } from '@angular/core';
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
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../interfaces/user';
import { ChannelDependenciesService } from '../../services/channel-dependencies.service';


interface ChannelAllData {
  userName?: string;
  messages?: any[]; // Si tienes un tipo específico para los mensajes, reemplaza {} con ese tipo.
}

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [ChatmsgboxComponent, CommonModule, FormsModule],
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
  currentUser: any = null;
  isChannelSelected$: Observable<boolean> = new Observable();
  isNewMessageVisible$: Observable<boolean> = new Observable();
  selectedChannel = signal<Channel | null>(null);
  channelObserved = signal<Channel | null>(null)
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
  }
  personSelectedForChannel: WritableSignal<User> = signal<User>(this.userEmpty);
  lastAnswer = signal<string>('')

  constructor(private store: Store, private channelService: ChannelService, private userService: UserService, public channelDependenciesService: ChannelDependenciesService){
    setInterval(()=>{
      let timestamp = this.channelService.getTodayDate();
      this.currentDate = this.channelService.getFormattedDate(timestamp);
    }, 1000)

    effect(()=>{
      if(this.selectedChannel()){
        console.log(this.selectedChannel());
        console.log('ChannelObserved Updated:', this.channelObserved());
        console.log(this.searchedPersons());
        console.log(this.namePerson());
        console.log(this.lastAnswer());
        this.personSelectedForChannel();
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
          // console.log('Canal observado emitido:', updatedChannel); 
          this.channelObserved.set(updatedChannel);
          
          if (updatedChannel.messages && updatedChannel.messages.length > 0) {
            updatedChannel.messages.forEach((message) => {
              // Verificar si el mensaje y su ID están definidos
              if (message && message.id) {
                this.channelService.observeLastThreadTimeFromMessage(message.id).subscribe((lastThreadTime) => {
                  if (lastThreadTime) {
                    // Asignamos el último tiempo del thread al mensaje
                    const updatedMessage = {
                      ...message,  // Copiar todos los valores del mensaje original
                      lastThreadTime: lastThreadTime  // Asigna el tiempo del último thread
                    };
  
                    // Actualizar el mensaje en el arreglo
                    const index = updatedChannel.messages.findIndex(msg => msg.id === message.id);
                    if (index !== -1) {
                      updatedChannel.messages[index] = updatedMessage; // Reemplazar el mensaje en el array
                    }
                  }
                });
              } else {
                console.log('We dont have anything here to show for', message);
              }
            });
          }
        });
      }
    });
    const sub2 = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;        
    });
    const sub3 = this.channelService.contentEditChannel$.subscribe(content =>{
      this.contentChannel.set(content)
    })
    const sub4 = this.userService.getUsers().subscribe((users) => {
      this.persons = users;
    });

    this.subscription.add(sub1);
    this.subscription.add(sub2);
    this.subscription.add(sub3);
    this.subscription.add(sub4);
  }

  showUsers(reaction: any, event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;
    const parentElement = targetElement.closest('.reaction-item') as HTMLElement;
    if (!parentElement) return;
  
    // Berechnung der relativen Position innerhalb des Elternelements
    const parentRect = parentElement.getBoundingClientRect();
    // const x = event.clientX - parentRect.left; // Position relativ zum Elternelement
    // const y = event.clientY - parentRect.top;
    const x = parentRect.left + parentRect.width / 2; // Zentriert über der Reaktion
    const y = parentRect.top - 10; // 10px oberhalb des Reaktionselements
    // const x = 27; 
    // const y = -23;
  // bottom 35px
  // left 25px
  // console.log('x: ',x-680);
  
    this.hoveredReaction = reaction;
    this.popupPosition = {
      x: x - 690,      
      // y: y - 40 // 40px oberhalb der Reaktion
      y: -126 
    };
  }

  hideUsers(): void {
    this.hoveredReaction = null;
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
    await this.channelService.deleteMessageChannel(messageId, channelID)
  }

  addPerson(){
    this.channelService.addUserToChannel(this.selectedChannel()!.id, this.personSelectedForChannel().id);
    this.deletePersonSelectedToChannel();
    this.closePopup()
  }

  searchPerson(){
    if(this.namePerson() !== ''){
      this.channelService.searchPerson(this.namePerson(), this.persons, this.channelObserved()!.members).subscribe(users => {
        this.searchedPersons.set(users);
      });
    }else{
      this.closeSearch();
    }
  }

  public closeSearch(){
    this.searchedPersons.set([]);
    this.namePerson.set('');
  }

  addPersonSelectedToChannel(user: User){
    this.personSelectedForChannel.set(user);
    this.closeSearch();
  }

  deletePersonSelectedToChannel(){
    this.personSelectedForChannel.set(this.userEmpty);
  }

  leaveAChannel(){
    this.channelService.removeMemberFromChannel(this.selectedChannel()!.id, this.currentUser.idFirebase)
  }

  // searchLastMessageTime(messageId){
  //   this.channelObserved()?.messages.map((message)=>{
  //     if(message.id === messageId){
  //       let lastIndex = message.threadIDS.length;
  //       let ThreadID = message[lastIndex -1]
  //     }
  //   })
  // }


}
