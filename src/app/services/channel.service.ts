import { inject, Injectable, signal } from '@angular/core';
import { collection, Firestore, onSnapshot, Timestamp } from '@angular/fire/firestore';


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

  private getChannelSelectedData(){
    
  }
}
