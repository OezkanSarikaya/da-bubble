import { effect, inject, Injectable, signal } from '@angular/core';
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
    for (const id of channel.messageIds) {
      const message: any = await this.getObjMsgInChannel(id); // Espera cada mensaje
      let avatarUrl: string = ''
      let nameSender: string = ''
      if(message.senderID){
        const senderID = message.senderID
        avatarUrl = await this.getAvatarByUserId(senderID);
        nameSender = await this.getNameSenderMessage(senderID);
      }
      let msg = {...message, fullName: nameSender, createdAtString: this.getFormattedDate(message.createdAt.seconds), time: this.formatTimestampTo24HourFormat(message.createdAt.seconds)}
      messages.push({msg, avatarUrl});
    }
    return {userName, messages};
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

  private async getObjMsgInChannel(idMessage: string): Promise<{} | ''>{
    const messagesDocRef = doc(this.firestore, 'messages', idMessage);
    const messageDoc = await getDoc(messagesDocRef);
    if (messageDoc.exists()) {
      const msgData = messageDoc.data();
      return msgData;
    } else {
      console.error('No se encontró el mensaje con ID:');
      return ''; // Devuelve una cadena vacía si no se encuentra el usuario
    }
  }

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

}
