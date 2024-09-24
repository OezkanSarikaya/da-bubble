import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { WorkspaceComponent } from './workspace/workspace.component';
import { ChannelComponent } from "./channel/channel.component";
import { ThreadComponent } from './thread/thread.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, WorkspaceComponent, ChannelComponent,ThreadComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
 // Zustand, ob die Thread-Komponente sichtbar ist
 isThreadVisible: boolean = true;

 // Methode zum Ändern des Zustands
 toggleThreadVisibility() {
   this.isThreadVisible = !this.isThreadVisible;
 }

 // Methode zum expliziten Einblenden der Thread-Komponente
 showThread() {
   this.isThreadVisible = true;
 }

 // Methode zum expliziten Ausblenden der Thread-Komponente
 hideThread() {
   this.isThreadVisible = false;
 }
 
}
