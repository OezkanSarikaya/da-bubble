import { Injectable } from '@angular/core';
import { Channel } from '../interfaces/channel';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class ChannelDependenciesService {

  constructor() { }

  isUserMemberChannel(channelObserved: Channel, currentUser: any){
    return channelObserved?.members.includes(currentUser.idFirebase)  
  }

  belongTheUserCurrentItem(userVerify: any, currentUser: any){
    return userVerify.id === currentUser.idFirebase
  }
}
