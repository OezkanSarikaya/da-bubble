import { effect, EventEmitter, inject, Injectable, signal } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, docData, Firestore, getDoc, onSnapshot, Timestamp, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';
import { BehaviorSubject, combineLatest, filter, forkJoin, Observable, switchMap, timestamp } from 'rxjs';
import { Message } from '../interfaces/message';
import { User } from '../interfaces/user';

// export interface Message {
//   content: string,
//   senderID: string,
//   createdAt: Date,
//   threadIDS: string[],
//   id: string,
//   senderData?: User,
//   createAtString?: string,
//   time?: string
// }

// export interface User {
//   avatar: string,
//   email: string,
//   fullName: string,
//   id: string,
// }

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
  //Aqui funcionaba todo
  observeChannel(channelId: string): Observable<Channel> {
    const channelDocRef = doc(this.firestore, 'channels', channelId);

      return new Observable<Channel>((observer) => {
        // Escuchamos cambios en el documento del canal en tiempo real
        onSnapshot(channelDocRef, (channelSnapshot) => {
          const channelData = channelSnapshot.data();

          if (!channelData?.['messageIDS']) {
            // Si no hay mensajes, devolvemos solo el canal
            observer.next(channelData as Channel);
          } else {
            const { messageIDS, members } = channelData;

            // Si hay mensajes, los cargamos como un Observable en tiempo real
            // const messageObservables = channelData['messageIDS'].map((messageId: string) =>
            //   this.fetchMessageWithUserAsObservable(messageId).pipe(
            //     filter((msg): msg is Message => msg !== null) // Filtramos `null`
            //   )
            // );
            // Obtenemos los observables de los mensajes
            const messageObservables = (messageIDS || []).map((messageId: string) =>
                this.fetchMessageWithUserAsObservable(messageId).pipe(
                    filter((msg): msg is Message => msg !== null) // Filtramos `null`
                )
            );

            // Obtenemos los observables de los miembros
            const memberObservables = (members || []).map((memberId: string) =>
                this.fetchUserAsObservable(memberId).pipe(
                    filter((user): user is User => user !== null) // Filtramos `null`
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
              observer.next(messageData); // Emitimos el mensaje con datos de usuario
            });
          } else {
            observer.next(null); // Mensaje no existe
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
            observer.next(userData); // Emitimos los datos del usuario
          } else {
            observer.next(null); // Usuario no existe
          }
        });
      });
  }

  // Obtener datos de usuario en tiempo real
  // private async fetchUser(userId: string): Promise<User | null> {
  //   const userDocRef = doc(this.firestore, 'users', userId);
  //   const userSnapshot = await getDoc(userDocRef);

  //   if (userSnapshot.exists()) {
  //     return {
  //       id: userSnapshot.id,
  //       ...userSnapshot.data(),
  //       avatar: userSnapshot.data()['avatar'],
  //       fullName: userSnapshot.data()['fullName'],
  //     } as User;
  //   } else {
  //     return null;
  //   }
  // }


  formatTimestampTo24HourFormat(timestampInSeconds: number): string {
    // Convertir segundos a milisegundos
    const date = new Date(timestampInSeconds * 1000);
  
    // Obtener la hora y los minutos
    const hours = date.getHours();
    const minutes = date.getMinutes();
  
    // Formatear a dos dígitos
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



}
