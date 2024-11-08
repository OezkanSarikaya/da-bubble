import { effect, EventEmitter, inject, Injectable, signal } from '@angular/core';
import { addDoc, arrayUnion, collection, doc, Firestore, getDoc, onSnapshot, Timestamp, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../interfaces/channel';
import { BehaviorSubject, Observable, timestamp } from 'rxjs';



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

  observeChannel(channelId: string) {
    const channelDocRef = doc(this.firestore, 'channels', channelId);
    return new Observable<Channel | null>((observer) => {
      // Suscríbete a cambios en el documento
      onSnapshot(channelDocRef, (doc) => {
        if (doc.exists()) {
          const channelData = {
            id: doc.id,
            ...doc.data(),
            createdAt: (doc.data()['createdAt'] as Timestamp).toDate(),
          } as Channel;
          observer.next(channelData); // Envía el canal actualizado a los suscriptores
        } else {
          observer.next(null); // Si el documento no existe, envía null
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
