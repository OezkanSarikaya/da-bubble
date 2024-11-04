import { effect, EventEmitter, inject, Injectable, signal } from '@angular/core';
import { collection, doc, Firestore, getDoc, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';

interface ChannelSelectedData {
  userName: string;
  messages: any[]; // Cambia `any` por el tipo específico si lo tienes para los mensajes.
}

interface MessageWithAvatar {
  msg: {};       // Cambia `any` por el tipo específico si tienes el tipo para un mensaje.
  avatarUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  allChannels = signal<any[]>([]);
  // Dentro de la clase ChannelService
  public messagesUpdated = new EventEmitter<MessageWithAvatar[]>();
  private messagesMap = new Map<string, MessageWithAvatar>();
  private avatarCache = new Map<string, string>(); // Cache de avatares para reducir lecturas

  private firestore: Firestore = inject(Firestore);

  constructor() {
    this.getAllChannels();
  }

  private getAllChannels(){
    const channelCollection = collection(this.firestore, 'channels');
    // Escuchar cambios en la colección en tiempo real
    onSnapshot(channelCollection, (snapshot) => {
      const channels = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
      }));
      this.allChannels.set(channels); // Emitimos los usuarios actualizados
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
        const messageId = docSnapshot.id;
        const senderID = message['senderID'];
        const threadID = message['threadID'];

        if (senderID) {
          let avatarUrl = this.avatarCache.get(senderID);
          if (!avatarUrl) {
            avatarUrl = await this.getAvatarByUserId(senderID);  // Obtenemos el avatar inicial
            this.observeUserAvatar(senderID); // Empezamos a observar cambios en el avatar del usuario
          }

          const nameSender = await this.getNameSenderMessage(senderID);
          // Aquí obtenemos la cantidad de mensajes en el hilo
          // Si `threadID` existe, observamos el conteo de threads en tiempo real
          if (threadID) {
            this.observeThreadCount(threadID, messageId, avatarUrl, nameSender, message);
          } else {
            // Si no hay `threadID`, establecemos el conteo en 0
            this.updateMessageWithThreadCount(messageId, 0, avatarUrl, nameSender, message);
          }
        }
      }
    });
  }

  // Nueva función para observar el conteo de mensajes en un `thread` en tiempo real
  private observeThreadCount(threadID: string, messageId: string, avatarUrl: string, nameSender: string, message: any) {
    const threadDocRef = doc(this.firestore, 'threads', threadID);

    onSnapshot(threadDocRef, (threadSnapshot) => {
      if (threadSnapshot.exists()) {
        const threadData = threadSnapshot.data();
        const threadCount = threadData['messages'] ? threadData['messages'].length : 0;
        
        // Actualizamos el mensaje con el conteo de threads en tiempo real
        this.updateMessageWithThreadCount(messageId, threadCount, avatarUrl, nameSender, message);
      } else {
        // Si no existe el thread, consideramos el conteo como 0
        this.updateMessageWithThreadCount(messageId, 0, avatarUrl, nameSender, message);
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
        countThreads: threadCount, // Asignamos el conteo de threads en tiempo real
      },
      avatarUrl,
    };
    this.messagesMap.set(messageId, msgWithAvatar);
    this.messagesUpdated.emit(Array.from(this.messagesMap.values()));
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
        this.messagesUpdated.emit(Array.from(this.messagesMap.values()));
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
      return userData['avatar'] || ''; // Ajusta `avatarUrl` al campo correcto en tu estructura de datos de Firebase
    } else {
      console.error('No se encontró el usuario con ID:', userId);
      return ''; // Devuelve una cadena vacía o una URL de avatar por defecto si no se encuentra el usuario
    }
  }

  // private async getObjMsgInChannel(idMessage: string): Promise<{} | ''>{
  //   const messagesDocRef = doc(this.firestore, 'messages', idMessage);
  //   const messageDoc = await getDoc(messagesDocRef);
  //   if (messageDoc.exists()) {
  //     const msgData = messageDoc.data();
  //     return msgData;
  //   } else {
  //     console.error('No se encontró el mensaje con ID:');
  //     return ''; // Devuelve una cadena vacía si no se encuentra el usuario
  //   }
  // }

  private async getCreatedByChannel(idUser: string): Promise<string>{
    const userDocRef = doc(this.firestore, 'users', idUser); // Asumiendo que tus usuarios están en la colección 'users'
    const userDoc = await getDoc(userDocRef); // Obtener el documento del usuario

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData['fullName'] || ''; // Devuelve el nombre del usuario o una cadena vacía si no existe
    } else {
      console.error('No se encontró el usuario con ID:', idUser);
      return ''; // Devuelve una cadena vacía si no se encuentra el usuario
    }
  }

  // public async countThreads(idThread: string): Promise<number>{
  //   const threadDocRef = doc(this.firestore, 'threads', idThread); // Asumiendo que tus usuarios están en la colección 'users'
  //   const threadDoc = await getDoc(threadDocRef); // Obtener el documento del usuario

  //   if (threadDoc.exists()) {
  //     const threadData = threadDoc.data();
  //     return threadData['messages']?.length; // Devuelve el nombre del usuario o una cadena vacía si no existe
  //   } else {
  //     console.error('No se encontró el usuario con ID:', idThread);
  //     return 0; // Devuelve una cadena vacía si no se encuentra el usuario
  //   }
  // }

}
