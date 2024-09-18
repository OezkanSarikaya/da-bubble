import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  clearPlaceholder(event: any) {
    event.target.placeholder = '';
  }

  restorePlaceholder(event: any, placeholderText: string) {
    if (!event.target.value) {
      event.target.placeholder = placeholderText;
    }
  }
}
