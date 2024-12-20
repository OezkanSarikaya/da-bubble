import { inject, Injectable } from '@angular/core';
import { Channel } from '../interfaces/channel';
import { User } from '../interfaces/user';
import { addDoc, arrayRemove, arrayUnion, collection, doc, Firestore, Timestamp, updateDoc } from '@angular/fire/firestore';
import { UserService } from './user.service';
import { BehaviorSubject, combineLatest, filter, firstValueFrom, map, Observable } from 'rxjs';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelDependenciesService {

  private firestore: Firestore = inject(Firestore);
  directMessage: string = 'Direct-Message-Only-For-Chat-Password'

  userEmpty: User = {
    avatar: '',
    email: '',
    fullName: '',
    id: '',
    status: '',
    uid: '',
  }

  private chatWithObject: BehaviorSubject<User> = new BehaviorSubject(this.userEmpty);
  public chatWith$: Observable<User> = this.chatWithObject.asObservable();

  constructor(private userService: UserService, private channelService: ChannelService,) { }

  public setChatWith(user: User){
    this.chatWithObject.next(user);
  }

  isUserMemberChannel(channelObserved: Channel, currentUser: any){
    return channelObserved?.members.includes(currentUser.idFirebase)  
  }

  belongTheUserCurrentItem(userVerify: any, currentUser: any){
    return userVerify.id === currentUser.idFirebase
  }

  async createChannelOnePerson(createdBy: string, name: string, description: string, memberId: string): Promise<void> {
    try {
      const newChannel = {
        createdBy,
        description,
        name,
        createdAt: Timestamp.now(), 
        messagesIDs: [], 
        members: [createdBy, memberId],
      };
      const channelCollection = collection(this.firestore, 'channels');
      await addDoc(channelCollection, newChannel);
      console.log('Canal creado con éxito:', newChannel);
    } catch (error) {
      console.error('Error al crear el canal:', error);
    }
  }

  async removeMemberFromChannel(channelId: string, memberId: string): Promise<void> {
    try {
      const channelDocRef = doc(this.firestore, 'channels', channelId);
      await updateDoc(channelDocRef, {
        members: arrayRemove(memberId),
      });
      console.log(`Miembro ${memberId} eliminado del canal ${channelId}`);
    } catch (error) {
      console.error('Error al eliminar el miembro:', error);
    }
  }

  async createChannelAllPeople(createdBy: string, name: string, description: string): Promise<void> {
    const userObservable: Observable<User[]> = this.userService.getUsers();
    const users = await firstValueFrom(userObservable.pipe(
      filter((users) => users.length > 0),
      map(users =>users.map(user => user.id))
      )
    );
    const newChannel = {
      createdBy,
      description,
      name,
      createdAt: Timestamp.now(),
      messagesIDs: [], 
      members: users || [], 
    };
    try {
      const channelCollection = collection(this.firestore, 'channels');
      await addDoc(channelCollection, newChannel);
      console.log('Canal creado con éxito:', newChannel);
    } catch (error) {
      console.error('Error al crear el canal:', error);
    }
  }

  async addUserToChannel(channelId: string, userId: string): Promise<void> {
    try {
      const channelDocRef = doc(this.firestore, `channels/${channelId}`);
      await updateDoc(channelDocRef, {
        members: arrayUnion(userId)
      });
      console.log(`User ${userId} added to channel ${channelId}`);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  public searchPersonNewChannel(namePerson: string, persons: any[]){
    const lowerCaseSearchTerm = namePerson.toLowerCase();
    const filteredPersons = persons.filter(person =>
        person.fullName.toLowerCase().includes(lowerCaseSearchTerm)
    );
    const userObservables = filteredPersons.map(person =>
        this.channelService.fetchUserAsObservable(person.id).pipe(
            filter((user): user is User => user !== null) 
        )
    );
    return combineLatest(userObservables);
  }

  public async createMessage(content: string, senderID: string, table: string, channelID: string){
    const messageCollection = collection(this.firestore, table);
    const channelCollection = doc(this.firestore, 'channels', channelID);
    const result = await addDoc(messageCollection, {
      content: content,
      createdAt: Timestamp.now(),
      senderID: senderID,
      threadIDS: [],
    });
    const messageID = result.id
    await updateDoc(channelCollection, {
      messageIDS: arrayUnion(messageID)
    });
  }

  async updateChannelName(channelId: string, newName: string): Promise<void> {
    try {
      const channelDocRef = doc(this.firestore, `channels/${channelId}`);
      await updateDoc(channelDocRef, { name: newName });
    } catch (error) {
      console.error('Error updating channel name:', error);
      throw error;
    }
  }

  async updateChannelDescription(channelId: string, newDescription: string): Promise<void> {
    try {
      const channelDocRef = doc(this.firestore, `channels/${channelId}`);
      await updateDoc(channelDocRef, { description: newDescription });
    } catch (error) {
      console.error('Error updating channel name:', error);
      throw error;
    }
  }

  public searchingChannelsDirectMessage(channels: Channel[]){
    return channels.filter(channel => channel.name === this.directMessage)
  }

  public channelDirectMesageFound(channelDirect: Channel[], userId: string, currentUserId: string): Channel | undefined{
    return channelDirect.find(channel => {
      const members = channel.members as string[]; 
      if (userId === currentUserId) {
        return members.filter(id => id === userId).length == 2;
      }
      return members.includes(userId) && members.includes(currentUserId);
    });
  }

}
