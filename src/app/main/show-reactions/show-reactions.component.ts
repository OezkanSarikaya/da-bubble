import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../interfaces/message';
// import { ChannelService } from '../../services/channel.service';

@Component({
  selector: 'app-show-reactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-reactions.component.html',
  styleUrl: './show-reactions.component.scss',
})
export class ShowReactionsComponent {
  @Input() reactions: any[] = [];
  // constructor(private channelService: ChannelService) {

  // }
}
