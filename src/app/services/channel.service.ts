import { effect, EventEmitter, inject, Injectable, signal } from '@angular/core';
import { collection, doc, Firestore, getDoc, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';
import { BehaviorSubject } from 'rxjs';

interface ChannelSelectedData {
  userName: string;
  messages: any[]; // Cambia `any` por el tipo específico si lo tienes para los mensajes.
}

interface MessageWithAvatar {
  msg: {};       // Cambia `any` por el tipo específico si tienes el tipo para un mensaje.
  avatarUrl: string;
}

export interface Channeldata {
  createdAt?: Date; 
  createdBy: string;
  description: string;
  id: string;
  member: [];
  messageIds: [];
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  allChannels = signal<any[]>([]);
  selectedChannel = signal<Channel | null>(null);
  // Dentro de la clase ChannelService
  public messagesUpdated = new BehaviorSubject<MessageWithAvatar[]>([]);
  public threadUpdatedMap = new BehaviorSubject<any[]>([]);
  private messagesMap = new Map<string, MessageWithAvatar>();
  private avatarCache = new Map<string, string>(); // Cache de avatares para reducir lecturas
  private threadMessagesMap = new Map<string, any>();

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
      this.allChannels.set(channels); // Emitimos los usuarios actualizados
    });
  }

  observeChannel(channelId: string) {
    const channelDocRef = doc(this.firestore, `channels/${channelId}`);

    onSnapshot(channelDocRef, (doc) => {
      if (doc.exists()) {
        const channelData = {
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
        } as Channel;
        this.selectedChannel.set(channelData); // Actualizamos la señal del canal seleccionado
      } else {
        this.selectedChannel.set(null);
      }
    });
  }

  async getChannelSelectedData(channel: Channel): Promise<ChannelSelectedData>{
    const userName = await this.getCreatedByChannel(channel.createdBy);   
    let messages: MessageWithAvatar[] = [];
    this.messagesMap.clear();
    for (const id of channel.messageIds) {
      this.observeMessage(id);
    }
    return {userName, messages};
  }

   // Escucha cambios en cada mensaje y su avatar en tiempo real
  private observeMessage(messageId: string) {
    const messageRef = doc(this.firestore, 'messages', messageId);
    onSnapshot(messageRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const message = docSnapshot.data();
        // const messageId = docSnapshot.id;
        const senderID = message['senderID'];
        const threadID = message['threadID'];
        if (senderID) {
          let avatarUrl = this.avatarCache.get(senderID);
          if (!avatarUrl) {
            avatarUrl = await this.getAvatarByUserId(senderID);  // Obtenemos el avatar inicial
            this.observeUserAvatar(senderID); // Empezamos a observar cambios en el avatar del usuario
          }
          const nameSender = await this.getNameSenderMessage(senderID);
          if (threadID) {
            this.observeThread(threadID, messageId, avatarUrl, nameSender, message);
          } else {
            this.updateMessageWithThreadCount(messageId, 0, avatarUrl, nameSender, message);
          }
        }
      }
    });
  }

  private observeThread(threadID: string, messageId: string, avatarUrl: string, nameSender: string, message: any) {
    const threadRef = doc(this.firestore, 'threads', threadID);
    onSnapshot(threadRef, (threadSnapshot) => {
      if (threadSnapshot.exists()) {
        const threadData = threadSnapshot.data();
        // console.log(threadData);
        // Suponiendo que los threads tienen un campo `messages` que es un array
        const messages = threadData['messages'] || [];
        const threadCount = messages.length;  // Contar los mensajes en el thread
          
        // Actualizar el mensaje con el conteo de threads
        this.updateMessageWithThreadCount(messageId, threadCount, avatarUrl, nameSender, message);
      }
    });
}
  // Función para actualizar el mensaje con el conteo de threads y emitir los cambios
  private updateMessageWithThreadCount(messageId: string, threadCount: number, avatarUrl: string, nameSender: string, message: any) {
    const msgWithAvatar: MessageWithAvatar = {
      msg: {
        ...message,
        id: messageId,
        fullName: nameSender,
        createdAtString: this.getFormattedDate(message['createdAt'].seconds),
        time: this.formatTimestampTo24HourFormat(message['createdAt'].seconds),
        threadCount, // Asignamos el conteo de threads en tiempo real
      },
      avatarUrl,
    };
    this.messagesMap.set(messageId, msgWithAvatar);
    this.messagesUpdated.next(Array.from(this.messagesMap.values()));
  }

  private observeUserAvatar(userId: string) {
    const userRef = doc(this.firestore, 'users', userId);

    onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const updatedAvatarUrl = docSnapshot.data()['avatar'];
        this.avatarCache.set(userId, updatedAvatarUrl);  // Cacheamos el avatar actualizado

        // Actualizamos los mensajes en `messagesMap` que corresponden a este usuario
        this.messagesMap.forEach((msgWithAvatar: any) => {
          if (msgWithAvatar['msg']['senderID'] === userId) {
            msgWithAvatar.avatarUrl = updatedAvatarUrl;
          }
        });

        // Emitimos los mensajes actualizados
        this.messagesUpdated.next(Array.from(this.messagesMap.values())); 
      }
    });
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

  private async getNameSenderMessage(senderID: string): Promise<string>{
    const userDocRef = doc(this.firestore, 'users', senderID);
    const userDoc = await getDoc(userDocRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData['fullName'] || ''; // Ajusta `avatarUrl` al campo correcto en tu estructura de datos de Firebase
    } else {
      console.error('No se encontró el usuario con ID:', senderID);
      return ''; // Devuelve una cadena vacía o una URL de avatar por defecto si no se encuentra el usuario
    }
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

  private async getAvatarByUserId(userId: string): Promise<string> {
    const userDocRef = doc(this.firestore, 'users', userId);
    const userDoc = await getDoc(userDocRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData['avatar'] || ''; 
    } else {
      console.error('No se encontró el usuario con ID:', userId);
      return ''; 
    }
  }

  private async getCreatedByChannel(idUser: string): Promise<string>{
    const userDocRef = doc(this.firestore, 'users', idUser);
    const userDoc = await getDoc(userDocRef); 
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData['fullName'] || ''; 
    } else {
      console.error('No se encontró el usuario con ID:', idUser);
      return ''; 
    }
  }

  public async loadThreadMessages(threadID: string) {
    console.log("Cargando mensajes del hilo:", threadID);
    const threadDocRef = doc(this.firestore, 'threads', threadID);
    onSnapshot(threadDocRef, async (threadDoc) => {
      if (threadDoc.exists()) {
        const threadData = threadDoc.data();
        const messages = threadData['messages'] || [];
        this.observeThreadMessages(messages); 
      } else {
        console.error('No se encontró el thread con ID:', threadID);
      }
    });
  }

  private observeThreadMessages(messageIds: string[]): void {
    messageIds.forEach((idMessage) => {
      const messageRef = doc(this.firestore, 'messages', idMessage);
      onSnapshot(messageRef, async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const messageData = docSnapshot.data();
          const senderID = messageData['senderID'];
          let avatarUrl = this.avatarCache.get(senderID) || '';
  
          if (!avatarUrl) {
            avatarUrl = await this.getAvatarByUserId(senderID);
            this.observeUserAvatarThread(senderID); 
          }
  
          const threadInfo = {
            ...messageData,
            userName: await this.getNameSenderMessage(senderID),
            createdAt: messageData['createdAt'].seconds,
            createdAtString: this.getFormattedDate(messageData['createdAt'].seconds),
            time: this.formatTimestampTo24HourFormat(messageData['createdAt'].seconds),
            avatarUrl,
          };
          this.threadMessagesMap.set(idMessage, threadInfo);
          this.threadUpdatedMap.next(Array.from(this.threadMessagesMap.values()));
        }
      });
    });

  }

  public getthreadMessagesUpdated() {
    return this.threadUpdatedMap.asObservable(); 
  }

  private observeUserAvatarThread(userId: string) {
    const userRef = doc(this.firestore, 'users', userId);
  
    onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const updatedAvatarUrl = docSnapshot.data()['avatar'];
        this.avatarCache.set(userId, updatedAvatarUrl);
        this.threadMessagesMap.forEach((message: any, messageId: string) => {
          if (message['senderID'] === userId) {
            message.avatarUrl = updatedAvatarUrl;
          }
        });
      }
    });
  }

}
