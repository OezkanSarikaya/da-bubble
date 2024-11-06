import { Component, effect, Input, input, Signal, SimpleChanges } from '@angular/core';
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
  // selectedChannel: Signal<Channel | null> = this.channelService.selectedChannel;

  @Input() messageReferenz!: { name: string, id: string };

  // constructor(private channelService: ChannelService){ 
  //   effect(() => {
  //      console.log(this.selectedChannel());
  //     });
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messageReferenz']) {
      // Aquí podemos reaccionar al cambio de messageReferenz
      console.log("Message Referenz actualizado desde el padre:", this.messageReferenz);
    }
  }
}
