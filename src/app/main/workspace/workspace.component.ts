import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  effect,
  Signal,
  HostListener, 
  signal,
  computed,
  ElementRef,
  viewChild,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { PersonService } from '../../services/person.service';
import { UserService } from '../../services/user.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  hideChannelComponent,
  showChannelComponent,
  showNewMessage,
  hideNewMessage,
} from '../../state/actions/triggerComponents.actions';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../interfaces/channel';
import { ChannelDependenciesService } from '../../services/channel-dependencies.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';


export interface channelCreate {
  name: string,
  description: string
}

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, SearchComponent, FormsModule],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'], // Hier den korrekten Schlüssel 'styleUrls' verwenden
})
export class WorkspaceComponent implements OnInit, OnDestroy {
  persons: any[] = [];
  private subscriptions: Subscription = new Subscription();

  isAddMembersInputVisible = false;
  isCreateChannelOpen = false;
  isPeopleChoiceOpen = false;
  isChannelOpen = true;
  isPrivateMessageOpen = true;
  isWorkspaceOpen = true;
  isAddChannelOpen = false;
  isBackdropVisible: boolean = false;
  channels$: Signal<Channel[]>;
  windowWidth: number = window.innerWidth;
  
  currentUser: any = null;
  closePopup = false;
  channelCreate = {
    name: '',
    description: ''
  }
  channelCreateSubject: BehaviorSubject<channelCreate> = new BehaviorSubject(this.channelCreate)
  channelCreate$: Observable<channelCreate> = this.channelCreateSubject.asObservable();
  nameTaken: boolean = false;
  userEmpty: User = {
    avatar: '',
    email: '',
    fullName: '',
    id: '',
    status: '',
    uid: '',
  }
  namePerson: WritableSignal<string> = signal<string>('');
  searchedPersons: WritableSignal<User[]> = signal<User[]>([]);
  personSelectedForChannel: WritableSignal<User> = signal<User>(this.userEmpty)

  
  constructor(
    private personService: PersonService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private store: Store<any>,
    private readonly channelService: ChannelService,
    public channelDependenciesService: ChannelDependenciesService
  ) {
    this.channels$ = this.channelService.allChannels;
    // Ejecuta un efecto para observar cambios en `channels$` en tiempo real
    effect(() => {
      console.log('Updated channels:', this.channels$());
      console.log(this.namePerson());
      console.log(this.searchedPersons());
      console.log(this.personSelectedForChannel());
      this.cdr.detectChanges();
    });
    this.channelCreate$.subscribe(createChannel =>{
      this.channels$().map(channel =>{
        this.nameTaken = channel.name.toLocaleLowerCase() === createChannel.name.toLocaleLowerCase();
        console.log(this.nameTaken);
      });
      console.log(createChannel);
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
  }

  ngOnInit(): void {
    // Benutzerliste abrufen
    this.subscriptions.add(
      this.userService.getUsers().subscribe((users) => {
        this.persons = users;

        // Actualizamos el estado de cada usuario en tiempo real
        this.persons.forEach((person) => {
          if (person.uid) {
            this.subscriptions.add(
              this.userService.getUserStatus(person.uid).subscribe((status) => {
                person.isOnline = status === 'online';
                // console.log(person);
                this.cdr.detectChanges(); // Actualizamos la vista
              })
            );
          }
        });
      })
    );

    const sub1 = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;        
    });
    this.subscriptions.add(sub1)
  }

  searchPerson(){
    if(this.namePerson() !== ''){
      this.channelDependenciesService.searchPersonNewChannel(this.namePerson(), this.persons).subscribe(users => {
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

  updateChannelCreate(){
    this.channelCreateSubject.next(this.channelCreate);
  }

  resetData(){
    this.channelCreate.name = '';
    this.channelCreate.description = ''
    this.channelCreateSubject.next(this.channelCreate);
    this.addPeopleChoicePopup();
    this.toggleAddChannel()
  }


  addPeopleToNewChannel(){
    if(this.isAddMembersInputVisible){
      console.log('selected user only');
      this.channelDependenciesService.createChannelOnePerson(this.currentUser.idFirebase, this.channelCreate.name, this.channelCreate.description, this.personSelectedForChannel().id)
    }else{
      console.log('add allUser');
      this.channelDependenciesService.createChannelAllPeople(this.currentUser.idFirebase, this.channelCreate.name, this.channelCreate.description);
    }
    this.resetData();
  }

  addPeopleChoicePopup() {





    if (!this.isPeopleChoiceOpen) {

      if (window.innerWidth >= 800) { 
        this.isAddChannelOpen = false;
      }
      this.isPeopleChoiceOpen = true;


      // Backdrop wird angezeigt
      this.isBackdropVisible = true;
      // Kleines Timeout, um das Display: none aufzuheben, bevor die Opacity-Animation startet
      setTimeout(() => {
        this.isPeopleChoiceOpen = true;
        document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
      }, 10);
    } else {
      // Blende den Backdrop aus
      this.isPeopleChoiceOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
      setTimeout(() => {
        this.isBackdropVisible = false;
        document.body.classList.remove('no-scroll');
        this.closePopup = true;
      }, 125); // Dauer der CSS-Transition (300ms)
    }
  }

  toggleAddMembersInput() {
    this.isAddMembersInputVisible = !this.isAddMembersInputVisible;
    // console.log(this.isAddMembersInputVisible);
    
  }

  getUsers() {
    this.userService.getUsers().subscribe(
      (users) => {
        this.persons = users; // Benutzerdaten speichern
        // console.log('Personen:', this.persons);

        // Online-Status für jeden Benutzer abrufen
        this.persons.forEach((person) => {
          // console.log(
          //   `Prüfe Online-Status für Person: ${person.fullname} mit ID: ${person.uid}`
          // );

          // Überprüfen ob person.uid korrekt übergeben wird
          if (!person.uid) {
            // console.error('UID für Person fehlt:', person);
            return; // Vorzeitiges Beenden, wenn UID fehlt
          }

          this.userService.getUserStatus(person.uid).subscribe((status) => {
            person.isOnline = status === 'online'; // Setze den Online-Status

            // Debug-Ausgabe für den gesetzten Status
            // console.log(
            //   `Online-Status für ${person.fullname}: ${person.isOnline}`
            // );

            this.cdr.detectChanges(); // Versuche die Change Detection zu erzwingen
          });
        });
      },
      (error) => {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      }
    );

  }

  ngOnDestroy() {
    // Unsubscribe von allen Realtime-Listenern
    this.subscriptions.unsubscribe();
  }

  // Methode zum Ausblenden der Thread-Komponente
  hide() {
    this.store.dispatch(hideChannelComponent());
    this.store.dispatch(showNewMessage());
  }

  // Methode, die das Einblenden auslöst
  onShowChannel(channel: Channel) {
    // this.findChannelClicked(channel.id);
    this.store.dispatch(showChannelComponent({ channel }));
    this.store.dispatch(hideNewMessage());
  }

  // Methode, die das Einblenden auslöst
  ontoggleNewMessage() {
    this.store.dispatch(showNewMessage());
  }

  togglePrivateMessage() {
    this.isPrivateMessageOpen = !this.isPrivateMessageOpen;
  }

  toggleChannels() {
    this.isChannelOpen = !this.isChannelOpen;
  }

  toggleWorkspace() {
    this.isWorkspaceOpen = !this.isWorkspaceOpen;
  }

  toggleAddChannel() {
    if (!this.isAddChannelOpen) {
      // Backdrop wird angezeigt
      this.isBackdropVisible = true;
      // Kleines Timeout, um das Display: none aufzuheben, bevor die Opacity-Animation startet
      setTimeout(() => {
        this.isAddChannelOpen = true;
        document.body.classList.add('no-scroll'); // Scrollen auf der Seite deaktivieren
      }, 10);
    } else {
      // Blende den Backdrop aus
      this.isAddChannelOpen = false;
      // Nach der Animation (300ms) wird der Backdrop komplett entfernt
      setTimeout(() => {
        this.isBackdropVisible = false;
        document.body.classList.remove('no-scroll');
      }, 300); // Dauer der CSS-Transition (300ms)
    }
  }

  
  
}
