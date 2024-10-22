import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'da-bubble';

  constructor(private userService: UserService) { }

  ngOnInit() {
    window.onbeforeunload = () => {
      const currentUser = this.userService.getCurrentUser();
      if (currentUser) {
        this.userService.setUserStatus(currentUser.uid, 'offline');
      }
    };
  }
}
