import { Component, effect, Signal } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-chatmsgbox',
  standalone: true,
  imports: [],
  templateUrl: './chatmsgbox.component.html',
  styleUrl: './chatmsgbox.component.scss'
})
export class ChatmsgboxComponent {
  selectedChannel: Signal<Channel | null> = this.channelService.selectedChannel;

  constructor(private channelService: ChannelService){ 
    effect(() => {
       console.log(this.selectedChannel());
      });
  }

}
