import { Injectable } from '@angular/core';
import { Channel } from '../interfaces/channel';

@Injectable({
  providedIn: 'root'
})
export class ChannelDependenciesService {

  constructor() { }

  isUserMemberChannel(channelObserved: Channel, currentUser: any){
    return channelObserved?.members.includes(currentUser.idFirebase)  
  }
}
