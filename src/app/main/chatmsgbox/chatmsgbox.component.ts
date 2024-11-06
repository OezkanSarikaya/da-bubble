import { Component, effect, ElementRef, Input, input, Signal, SimpleChanges, viewChild } from '@angular/core';
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

  @Input() messageReferenz!: { name: string, idChannel: string, userLoginId: string };
  inputText: Signal<ElementRef | undefined> = viewChild('inputText');

  constructor(private channelService: ChannelService){ 
    // effect(() => {
    //    console.log(this.selectedChannel());
    //   });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messageReferenz']) {
      // Aquí podemos reaccionar al cambio de messageReferenz
      console.log("Message Referenz actualizado desde el padre:", this.messageReferenz);
    }
  }

  async sendMessage(){
    if(this.messageReferenz){
      let content = this.inputText()?.nativeElement.value;
      await this.channelService.sendMessageTo(this.messageReferenz.userLoginId, this.messageReferenz.idChannel, content)
    }else{
      console.log('to persons');
    }
  }


}
