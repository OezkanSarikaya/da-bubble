import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.scss'
})
export class RecoverPasswordComponent {
  isAllField: boolean = true;
  emailError: boolean = true;
  
 
  clearPlaceholder(event: any) {
    event.target.placeholder = '';
  }

  restorePlaceholder(event: any, placeholderText: string) {
    if (!event.target.value) {
      event.target.placeholder = placeholderText;
    }
  }
}
