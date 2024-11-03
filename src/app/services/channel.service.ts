import { inject, Injectable, signal } from '@angular/core';
import { collection, doc, Firestore, getDoc, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';

interface ChannelSelectedData {
  userName: string;
  messages: any[]; // Cambia `any` por el tipo específico si lo tienes para los mensajes.
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
    console.log('Nombre del usuario que creó el canal:', userName);
    let messages: any = [];
    for (const id of channel.messageIds) {
      const msg = await this.getObjMsgInChannel(id); // Espera cada mensaje
      messages.push(msg);
    }
    return {userName, messages};
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
