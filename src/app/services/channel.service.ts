import { effect, EventEmitter, inject, Injectable, signal } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, Firestore, getDoc, onSnapshot, Timestamp, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';
import { BehaviorSubject, Observable, timestamp } from 'rxjs';

export interface Message {
  content: string,
  createdAt: Date,
  senderID: string,
  threadIDS: [],
  id: string
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

  // observeChannel(channelId: string) {
  //   const channelDocRef = doc(this.firestore, 'channels', channelId);
  //   return new Observable<Channel | null>((observer) => {
  //     // Suscríbete a cambios en el documento
  //     onSnapshot(channelDocRef, (doc) => {
  //       if (doc.exists()) {
  //         const channelData = {
  //           id: doc.id,
  //           ...doc.data(),
  //           createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
  //         } as Channel;
  //         observer.next(channelData); // Envía el canal actualizado a los suscriptores
  //       } else {
  //         observer.next(null); // Si el documento no existe, envía null
  //       }
  //     });
  //   });
  // }

  observeChannel(channelId: string): Observable<Channel | null> {
    const channelDocRef = doc(this.firestore, 'channels', channelId);

    return new Observable<Channel | null>((observer) => {
      onSnapshot(channelDocRef, async (snapshot) => {
        if (snapshot.exists()) {
          const channelData = {
            id: snapshot.id,
            ...snapshot.data(),
            createdAt: (snapshot.data()['createdAt'] as Timestamp).toDate(),
          } as Channel;

          // Cargar los datos completos de los mensajes usando los IDs en messageIDS
          if (channelData.messageIDS && channelData.messageIDS.length > 0) {
            const messagePromises = channelData.messageIDS.map(async (messageId: string) => {
              const messageDocRef = doc(this.firestore, 'messages', messageId);
              const messageSnapshot = await getDoc(messageDocRef);
              if (messageSnapshot.exists()) {
                return {
                  id: messageSnapshot.id,
                  ...messageSnapshot.data(),
                  createdAt: (messageSnapshot.data()['createdAt'] as Timestamp).toDate(),
                } as Message;
              } else {
                return null;
              }
            });

            // Esperar a que todas las promesas se resuelvan y filtrar mensajes nulos
            const messages = (await Promise.all(messagePromises)).filter(msg => msg !== null) as [];
            channelData['messageIDS'] = messages; // Agregar los mensajes completos al objeto channelData
          } else {
            channelData['messageIDS'] = []; // Si no hay mensajes, asignar un array vacío
          }

          observer.next(channelData); // Enviar el canal con los datos completos de los mensajes
        } else {
          observer.next(null); // Si el documento no existe, emitir null
        }
      });
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
