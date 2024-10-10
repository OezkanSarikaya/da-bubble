import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { RegisterComponent } from './register/register.component';
import { MainComponent } from './main/main.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AvatarComponent } from './avatar/avatar.component';

export const routes: Routes = [
  {path: "", component: LoginComponent},
  {path: "recover-password", component: RecoverPasswordComponent},
  {path: "register", component: RegisterComponent},
  {path: "main", component: MainComponent},
  {path: "imprint", component: ImprintComponent},
  {path: "privacy", component: PrivacyComponent},
  {path: "avatar", component: AvatarComponent}
];
