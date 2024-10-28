import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { RegisterComponent } from './register/register.component';
import { MainComponent } from './main/main.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
// import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';
import { AuthGuard  } from '@angular/fire/auth-guard';
import { authGuard } from './auth.guard'; // Deine Auth Guard Datei
import { VerifyEmailComponent } from './shared/verify-email/verify-email.component';

export const routes: Routes = [
  {path: "", component: LoginComponent},
  // {path: "login", component: LoginComponent},
  {path: "recover-password", component: RecoverPasswordComponent},
  {path: "register", component: RegisterComponent}, 
  {path: "main", component: MainComponent, canActivate: [authGuard]},
  // {path: "main", component: MainComponent},
  {path: "imprint", component: ImprintComponent},
  {path: "privacy", component: PrivacyComponent},
  {path: "avatar", component: AvatarComponent},
  {path: "reset-password", component: ResetPasswordComponent},
  { path: 'verify-email', component: VerifyEmailComponent },
];
