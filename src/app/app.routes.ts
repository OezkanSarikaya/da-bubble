import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { RegisterComponent } from './register/register.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
  {path: "", component: LoginComponent},
  {path: "recover-password", component: RecoverPasswordComponent},
  {path: "register", component: RegisterComponent},
  {path: "main", component: MainComponent}
];
