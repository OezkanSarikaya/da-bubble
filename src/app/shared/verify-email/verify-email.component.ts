import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent {
  constructor(private route: ActivatedRoute, private userService: UserService, private router: Router) {}

  // ngOnInit(): void {
  //   this.route.queryParams.subscribe(async (params) => {
  //     const oobCode = params['oobCode'];
  //     if (oobCode) {
  //       try {
  //         await this.userService.verifyEmail(oobCode);
  //         console.log('Email verified successfully');
  //         this.router.navigate(['/']); // Redirect to login or home page
  //         // Redirect to login or home page
  //       } catch (error) {
  //         console.error('Error verifying email:', error);
  //       }
  //     }
  //   });
  // }
}
