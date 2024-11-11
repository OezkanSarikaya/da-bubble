import { effect, EventEmitter, inject, Injectable, signal } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, docData, Firestore, getDoc, onSnapshot, Timestamp, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';
import { BehaviorSubject, Observable, switchMap, timestamp } from 'rxjs';

export interface Message {
  content: string,
  createdAt: Date,
  senderID: string,
  threadIDS: string[],
  id: string,
  senderData?: User,
  createAtString?: string,
  time?: string
}

export interface User {
  avatar: string,
  email: string,
  fullName: string,
  id: string,
}

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
  
    return docData(channelDocRef).pipe(
      switchMap(async (channelData: any) => {
        if (channelData?.messageIDS) {
          // Cargar todos los mensajes completos usando los IDs en messageIDS
          const messagePromises = channelData.messageIDS.map(async (messageId: string) => {
            return this.fetchMessageWithUser(messageId); // Método que obtiene datos completos del mensaje
          });
          const messages = await Promise.all(messagePromises);
          // Retornar el canal con los mensajes completos
          return { ...channelData, messageIDS: messages } as Channel;
        } else {
          return channelData as Channel;
        }
      })
    );
  }

  // Obtener mensaje y datos de usuario
  private async fetchMessageWithUser(messageId: string): Promise<Message | null> {
    const messageDocRef = doc(this.firestore, 'messages', messageId);
    const messageSnapshot = await getDoc(messageDocRef);

    if (messageSnapshot.exists()) {
      const messageDataFromDb = messageSnapshot.data();
      const createdAtTimestamp = messageDataFromDb['createdAt'] as Timestamp;
      const messageData: Message = {
        id: messageSnapshot.id,
        ...messageDataFromDb,
        createdAt: createdAtTimestamp.toDate(), // Conversión a Date para createdAt
        createAtString: this.getFormattedDate(createdAtTimestamp.seconds), // Formato de fecha legible
        time: this.formatTimestampTo24HourFormat(createdAtTimestamp.seconds) 
      } as Message ;

      const userData = await this.fetchUser(messageData.senderID);
      if (userData) {
        messageData.senderData = userData; // Agregar datos de usuario al mensaje en un campo separado
      }
      return messageData;
    } else {
      return null;
    }
  }

  // Obtener datos de usuario en tiempo real
  private async fetchUser(userId: string): Promise<User | null> {
    const userDocRef = doc(this.firestore, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data(),
        avatar: userSnapshot.data()['avatar'],
        fullName: userSnapshot.data()['fullName'],
      } as User;
    } else {
      return null;
    }
  }


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
