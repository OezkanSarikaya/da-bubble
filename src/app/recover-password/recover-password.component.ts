import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss'
})
export class RecoverPasswordComponent {
  clearPlaceholder(event: any) {
    event.target.placeholder = '';
  }

  restorePlaceholder(event: any, placeholderText: string) {
    if (!event.target.value) {
      event.target.placeholder = placeholderText;
    }
  }
}
