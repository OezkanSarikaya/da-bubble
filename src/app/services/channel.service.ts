import { effect, inject, Injectable, signal } from '@angular/core';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, Firestore, getDoc, onSnapshot, Timestamp, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';
import { BehaviorSubject, combineLatest, filter, firstValueFrom, forkJoin, map, Observable } from 'rxjs';
import { Message } from '../interfaces/message';
import { User } from '../interfaces/user';
import { ThreadMessage } from '../interfaces/threadMessage';
import { user } from '@angular/fire/auth';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  allChannels = signal<Channel[]>([]);
  selectedChannel = signal<Channel | null>(null);
  private contentEditChannelSubject: BehaviorSubject<string> = new BehaviorSubject('');
  contentEditChannel$: Observable<string> = this.contentEditChannelSubject.asObservable();

  private contentEditThreadSubject: BehaviorSubject<string> = new BehaviorSubject('');
  contentEditThread$: Observable<string> = this.contentEditThreadSubject.asObservable();

  private contextSubject: BehaviorSubject<string> = new BehaviorSubject('');
  context$: Observable<string> = this.contextSubject.asObservable();
 
  
  private firestore: Firestore = inject(Firestore);

  constructor(private userService: UserService) {
    this.getAllChannels();
    effect(()=>{
      console.log(this.allChannels());
    })
  }

  setContentChannel(content: string){
    this.contentEditChannelSubject.next(content);
  }

  setContentThread(content: string){
    this.contentEditThreadSubject.next(content);
  }

  setContext(context: string){
    this.contextSubject.next(context);
  }

  private getAllChannels(){
    const channelCollection = collection(this.firestore, 'channels');
    onSnapshot(channelCollection, (snapshot) => {
      const channels = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
      } as Channel));
      this.allChannels.set(channels); 
    });
  }

 
  observeChannel(channelId: string): Observable<Channel> {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
      return new Observable<Channel>((observer) => {
        onSnapshot(channelDocRef, (channelSnapshot) => {
          const channelData = channelSnapshot.data();

          if (!channelData?.['members']) {
            observer.next(channelData as Channel);
          } else {
            const { messageIDS, members, createdBy } = channelData;
            const messageObservables = (messageIDS && messageIDS.length > 0) 
                ? messageIDS.map((messageId: string) => 
                    this.fetchMessageWithUserAsObservable(messageId).pipe(filter((msg): msg is Message => msg !== null))
                  )
                : [new Observable<Message[]>(observer => observer.next([]))];

            const memberObservables = (members || []).map((memberId: string) =>
                this.fetchUserAsObservable(memberId).pipe(
                    filter((user): user is User => user !== null)
                )
            );

            const creatorObservable = this.fetchUserAsObservable(createdBy).pipe(
              filter((user): user is User => user !== null))
              
           combineLatest([combineLatest(messageObservables), combineLatest(memberObservables), creatorObservable])
            .subscribe(([messages, membersData, creatorObservable]) => {
                observer.next({
                    ...channelData,
                    creatorChannelData: creatorObservable,
                    messages: messages,                    
                    membersData: membersData, 
                } as Channel);
            });
          }
        });
      });
  }

  private fetchMessageWithUserAsObservable(messageId: string): Observable<Message | null> {
    const messageDocRef = doc(this.firestore, 'messages', messageId);

      return new Observable<Message | null>((observer) => {
        onSnapshot(messageDocRef, async (messageSnapshot) => {
          if (messageSnapshot.exists()) {
            const messageDataFromDb = messageSnapshot.data();
            const createdAtTimestamp = messageDataFromDb['createdAt'] as Timestamp;
            const messageData: Message = {
              id: messageSnapshot.id,
              ...messageDataFromDb,        
              reactions: messageDataFromDb['reactions'] || [],   
              createdAt: createdAtTimestamp.toDate(),
              createAtString: this.getFormattedDate(createdAtTimestamp.seconds),
              time: this.formatTimestampTo24HourFormat(createdAtTimestamp.seconds)
            } as Message;

            this.fetchUserAsObservable(messageData.senderID).subscribe((userData) => {
              if (userData) {
                const messageDataWithSender = { ...messageData, senderData: userData };
                observer.next(messageDataWithSender);
              }else{
                observer.next(messageData); 
              }
            });
          } else {
            observer.next(null); 
          }
        });
      });
  }

  public fetchUserAsObservable(userId: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, 'users', userId);

      return new Observable<User | null>((observer) => {
        onSnapshot(userDocRef, (userSnapshot) => {
          if (userSnapshot.exists()) {
            const statusObservable = this.userService.getUserStatus(userSnapshot.data()['uid']);
            statusObservable.subscribe((status) => {
                const userData: User = {
                    id: userSnapshot.id,
                    ...userSnapshot.data(),
                    avatar: userSnapshot.data()['avatar'],
                    fullName: userSnapshot.data()['fullName'],
                    status: status 
                } as User;
                observer.next({...userData});
            });
          } else {
            observer.next(null); 
          }
        });
      });
  }

  formatTimestampTo24HourFormat(timestampInSeconds: number): string {
    const date = new Date(timestampInSeconds * 1000);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  }

  
  public getFormattedDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    const formatter = new Intl.DateTimeFormat('de-DE', options);
    return formatter.format(date);
  }

  public getTodayDate(): number{
    let timestampSecond = Math.floor(Date.now()/1000);
    return timestampSecond;
  }

  public async createThreadedMessage(content: string, senderID: string, table: string, parentMessageID: string) {
    const messageCollection = collection(this.firestore, table);
    const result = await addDoc(messageCollection, {
      content: content,
      createdAt: Timestamp.now(),
      senderID: senderID,
      threadIDS: [],
    });
    const newMessageID = result.id;
    const parentMessageRef = doc(this.firestore, table, parentMessageID);
    await updateDoc(parentMessageRef, {
      threadIDS: arrayUnion(newMessageID) 
    });
  }

  observeThread(MessageId: string): Observable<ThreadMessage> {
    const channelDocRef = doc(this.firestore, 'messages', MessageId);
      return new Observable<ThreadMessage>((observer) => {
        onSnapshot(channelDocRef, (channelSnapshot) => {
          const MessageData = channelSnapshot.data() as ThreadMessage; 
          if (!MessageData) {
            return; 
          } 
          const createdAt = MessageData['createdAt'] instanceof Timestamp
                ? (MessageData['createdAt'] as Timestamp).toDate()
                : MessageData['createdAt'];

          const { threadIDS, senderID } = MessageData;  

          if (!MessageData?.['threadIDS']?.length) {
            const userObservable = this.fetchUserAsObservable(senderID).pipe(
              filter((user): user is User => user !== null)
            );
            userObservable.subscribe((user)=>{
              const threadMessageCopy = {
                ...MessageData,
                senderData: user,        
                createdAt: createdAt,
                createdAtString: this.getFormattedDate(createdAt?.getTime() / 1000 || 0),
                time: this.formatTimestampTo24HourFormat(createdAt?.getTime() / 1000 || 0)
              }
              observer.next(threadMessageCopy as ThreadMessage);
              console.log(MessageData);
            })        
          } else {
            const threadObservables = (threadIDS || []).map((messageId: string) =>
                this.fetchMessageWithUserAsObservable(messageId).pipe(
                    filter((msg): msg is Message => msg !== null)
                )
            );
            const userObservable = this.getUserObservable(senderID)

            combineLatest([combineLatest(threadObservables), userObservable])
                    .subscribe(([threadData, user]) => {
                      const threadMessageCopy = {
                        ...MessageData,
                        threadData: threadData,
                        senderData: user,        
                        createdAt: createdAt,
                        createdAtString: this.getFormattedDate(createdAt?.getTime() / 1000 || 0),
                        time: this.formatTimestampTo24HourFormat(createdAt?.getTime() / 1000 || 0)
                      }
                        observer.next(threadMessageCopy as ThreadMessage);
                    });
          }
        });
      });
  }


  private getUserObservable(senderID: string){
    const userObservable = this.fetchUserAsObservable(senderID).pipe(
      filter((user): user is User => user !== null)
    );
    return userObservable;
  }

  async getMessageContentById(messageId: string): Promise<string> {
      const messageDocRef = doc(this.firestore, 'messages', messageId);
      try {
          const messageSnapshot = await getDoc(messageDocRef);
          if (messageSnapshot.exists()) {
              const messageData = messageSnapshot.data();           
              return messageData['content'] as string; 
          } else {
              console.log(`Message with ID ${messageId} not found.`);
              return '';
          }
      } catch (error) {
          console.error("Error fetching message content:", error);
          return '';
      }
  }

  async updateMessageContent(messageId: string, newContent: string): Promise<void> {
      const messageDocRef = doc(this.firestore, 'messages', messageId);
      try {
          await updateDoc(messageDocRef, { content: newContent });
          console.log(`Message ${messageId} updated successfully!`);
      } catch (error) {
          console.error("Error updating message content:", error);
      }
  }

  async deleteMessageChannel(messageId: string, channelId: string): Promise<void> {
    try {
      const messageDocRef = doc(this.firestore, `messages/${messageId}`);

      const messageSnapshot = await getDoc(messageDocRef);
      console.log(messageSnapshot);
      if (messageSnapshot.exists()) {
        const messageData = messageSnapshot.data();
        const threadIds = messageData?.['threadIDS'] || [];
        console.log(threadIds);

        if (threadIds.length > 0) {
          const threadDeletePromises = threadIds.map(async (threadId: string) => {
            const threadDocRef = doc(this.firestore, `messages/${threadId}`);
            await deleteDoc(threadDocRef);
            console.log(`Hilo con ID ${threadId} eliminado.`);
          });
          await Promise.all(threadDeletePromises); 
          console.log('Todos los hilos relacionados eliminados.');
        }
      }

      await deleteDoc(messageDocRef);
      console.log('Mensaje eliminado de la colección messages');

      const channelDocRef = doc(this.firestore, `channels/${channelId}`);
      await updateDoc(channelDocRef, {
        messageIDS: arrayRemove(messageId) 
      });
      console.log('Message ID eliminado del array messageIDS en la colección channels');
      
    } catch (error) {
      console.error('Error al eliminar el mensaje y actualizar el canal:', error);
    }
  }

  async deleteMessageThread(messageID: string, parentMessageID: string): Promise<void> {
    try {
      const messageDocRefParent = doc(this.firestore, `messages/${parentMessageID}`);
      const messageSnapshotParent = await getDoc(messageDocRefParent);
      if (messageSnapshotParent.exists()) {
        const parentMessageData = messageSnapshotParent.data();
         if (parentMessageData?.['threadIDS']?.includes(messageID)) {
          const updatedThreadIds = parentMessageData['threadIDS'].filter((id: string) => id !== messageID);
          await updateDoc(messageDocRefParent, { threadIDS: updatedThreadIds });
          console.log(`Mensaje hijo ${messageID} eliminado de threadIDS del mensaje padre ${parentMessageID}`);
        }else {
          console.warn(`El mensaje padre con ID ${parentMessageID} no existe.`);
        }
        const messageDocRef = doc(this.firestore, `messages/${messageID}`);
        await deleteDoc(messageDocRef);
        console.log('Mensaje eliminado de la colección messages');
      }
    } catch (error) {
      console.error('Error al eliminar el mensaje y actualizar el canal:', error);
    }
  }

  //Serach Person that are not in the channel yet
  public searchPerson(namePerson: string, persons: any[], existingMemberIds: string[]){
    const lowerCaseSearchTerm = namePerson.toLowerCase();
    const filteredPersons = persons.filter(person =>
        person.fullName.toLowerCase().includes(lowerCaseSearchTerm) &&
        !existingMemberIds.includes(person.id)
    );
    const userObservables = filteredPersons.map(person =>
        this.fetchUserAsObservable(person.id).pipe(
            filter((user): user is User => user !== null) 
        )
    );
    return combineLatest(userObservables);
  }
  
  observeLastThreadTimeFromMessage(messageId: string): Observable<string | null> {
    return new Observable<string | null>((observer) => {
      this.observeThread(messageId).subscribe((parentMessage) => {
        if (parentMessage?.threadIDS?.length) {
          const threadObservables = parentMessage.threadIDS.map((threadId) =>
            this.fetchMessageWithUserAsObservable(threadId)
          );
  
          combineLatest(threadObservables).subscribe((threads) => {
            const lastThread = threads
              .filter((thread): thread is Message => thread !== null) 
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  
            if (lastThread) {
              const formattedTime = this.formatTimestampTo24HourFormat(
                lastThread.createdAt.getTime() / 1000
              );
              observer.next(formattedTime);
            } else {
              observer.next(null);
            }
          });
        } else {
          observer.next(null);
        }
      });
    });
  }
  
}






