import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type login = {
  email: boolean,
  password: boolean
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isAllField: boolean = true;
  errorForm: login = {
    email: true,
    password: true,
  }
  clearPlaceholder(event: any) {
    event.target.placeholder = '';
  }

  restorePlaceholder(event: any, placeholderText: string) {
    if (!event.target.value) {
      event.target.placeholder = placeholderText;
    }
  }
}
