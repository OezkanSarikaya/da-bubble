import { effect, inject, Injectable, signal } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, Firestore, onSnapshot, Timestamp, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';
import { combineLatest, filter, forkJoin, Observable } from 'rxjs';
import { Message } from '../interfaces/message';
import { User } from '../interfaces/user';
import { ThreadMessage } from '../interfaces/threadMessage';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  allChannels = signal<Channel[]>([]);
  selectedChannel = signal<Channel | null>(null);
 
  
  private firestore: Firestore = inject(Firestore);

  constructor() {
    this.getAllChannels();
    effect(()=>{
      console.log(this.allChannels());
    })

  }

  private getAllChannels(){
    const channelCollection = collection(this.firestore, 'channels');
    // Escuchar cambios en la colección en tiempo real
    onSnapshot(channelCollection, (snapshot) => {
      const channels = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
      } as Channel));
      this.allChannels.set(channels); 
    });
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
  
  observeChannel(channelId: string): Observable<Channel> {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
      return new Observable<Channel>((observer) => {
        onSnapshot(channelDocRef, (channelSnapshot) => {
          const channelData = channelSnapshot.data();

          if (!channelData?.['messageIDS']) {
            observer.next(channelData as Channel);
          } else {
            const { messageIDS, members } = channelData;

            const messageObservables = (messageIDS || []).map((messageId: string) =>
                this.fetchMessageWithUserAsObservable(messageId).pipe(
                    filter((msg): msg is Message => msg !== null)
                )
            );

            const memberObservables = (members || []).map((memberId: string) =>
                this.fetchUserAsObservable(memberId).pipe(
                    filter((user): user is User => user !== null)
                )
            );

           combineLatest([combineLatest(messageObservables), combineLatest(memberObservables)])
            .subscribe(([messages, membersData]) => {
                observer.next({
                    ...channelData,
                    messages: messages,
                    membersData: membersData, // Nueva propiedad con datos de los miembros
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
              createdAt: createdAtTimestamp.toDate(),
              createAtString: this.getFormattedDate(createdAtTimestamp.seconds),
              time: this.formatTimestampTo24HourFormat(createdAtTimestamp.seconds)
            } as Message;

            this.fetchUserAsObservable(messageData.senderID).subscribe((userData) => {
              if (userData) {
                messageData.senderData = userData;
              }
              observer.next(messageData); 
            });
          } else {
            observer.next(null); 
          }
        });
      });
  }

  private fetchUserAsObservable(userId: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, 'users', userId);

      return new Observable<User | null>((observer) => {
        onSnapshot(userDocRef, (userSnapshot) => {
          if (userSnapshot.exists()) {
            const userData: User = {
              id: userSnapshot.id,
              ...userSnapshot.data(),
              avatar: userSnapshot.data()['avatar'],
              fullName: userSnapshot.data()['fullName'],
            } as User;
            observer.next(userData); 
          } else {
            observer.next(null); 
          }
        });
      });
  }

  formatTimestampTo24HourFormat(timestampInSeconds: number): string {
    //// Convertir segundos a milisegundos
    const date = new Date(timestampInSeconds * 1000);
  
    // Get the hour and minutes
    const hours = date.getHours();
    const minutes = date.getMinutes();
  
    // Format to two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}`;
  }

  
  private getFormattedDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    // Usamos Intl.DateTimeFormat para formatear la fecha
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', // Nombre del día (ej. "Dienstag")
      day: 'numeric', // Día del mes
      month: 'long', // Nombre del mes (ej. "Januar")
      year: 'numeric' // Año
    };

    const formatter = new Intl.DateTimeFormat('de-DE', options);
    return formatter.format(date);
  }

  public async createThreadedMessage(content: string, senderID: string, table: string, parentMessageID: string) {
    // 1. Create the new message in the specified collection
    const messageCollection = collection(this.firestore, table);
    const result = await addDoc(messageCollection, {
      content: content,
      createdAt: Timestamp.now(),
      senderID: senderID,
      threadIDS: [],
    });

    // 2. Get the ID of the newly created message
    const newMessageID = result.id;

    // 3. Update the original message ('parentMessageID') to add the new message to 'threadIDS'
    const parentMessageRef = doc(this.firestore, table, parentMessageID);
    await updateDoc(parentMessageRef, {
      threadIDS: arrayUnion(newMessageID)  // Añadir el nuevo mensaje a `threadIDS`
    });
  }

  observeThread(MessageId: string): Observable<ThreadMessage> {
    const channelDocRef = doc(this.firestore, 'messages', MessageId);
      return new Observable<ThreadMessage>((observer) => {
        onSnapshot(channelDocRef, (channelSnapshot) => {
          const MessageData = channelSnapshot.data() as ThreadMessage;
          console.log(MessageData);

          if (!MessageData?.['threadIDS']?.length) {
            observer.next(MessageData as ThreadMessage);
            console.log(MessageData);
          } else {
            const { threadIDS, senderID } = MessageData;
            console.log(threadIDS);
            console.log(senderID);
          

            const threadObservables = (threadIDS || []).map((messageId: string) =>
                this.fetchMessageWithUserAsObservable(messageId).pipe(
                    filter((msg): msg is Message => msg !== null)
                )
            );

            // Creamos observable para el usuario `senderID`
            const userObservable = this.fetchUserAsObservable(senderID).pipe(
              filter((user): user is User => user !== null)
            );

            console.log(threadObservables);
            console.log(userObservable);

            combineLatest([combineLatest(threadObservables), userObservable])
                    .subscribe(([threadData, user]) => {
                        observer.next({
                            ...MessageData,
                            threadData: threadData,  // Los mensajes en `threadIDS` con datos de usuario
                            senderData: user,        // Datos del usuario que envió el mensaje original
                        });
                    });
          }
        });
      });
  }


}
