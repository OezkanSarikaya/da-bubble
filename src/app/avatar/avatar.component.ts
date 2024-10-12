import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { UserService } from "../services/user.service";
import { Register } from "../interfaces/register";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";

@Component({
	selector: "app-avatar",
	standalone: true,
	imports: [RouterModule, FormsModule, CommonModule],
	templateUrl: "./avatar.component.html",
	styleUrl: "./avatar.component.scss",
})
export class AvatarComponent {
	person$!: Register;
	subscription: Subscription = new Subscription();
	avatars = [
		"./assets/img/img_profile/profile1.png",
		"./assets/img/img_profile/profile2.png",
		"./assets/img/img_profile/profile3.png",
		"./assets/img/img_profile/profile4.png",
		"./assets/img/img_profile/profile5.png",
		"./assets/img/img_profile/profile6.png",
	];

	constructor(private router: Router, private userService: UserService) {}

	ngOnInit(): void {
		const sub = this.userService.getUser().subscribe((p) => {
			this.person$ = p;
      this.person$.avatar = "./assets/img/profile.svg";
		});
		this.subscription.add(sub);
		console.log(this.person$);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

  selectAvatar(avatarURL: string){
    this.person$.avatar = avatarURL;
  }

	registerDataBase() {
		if (this.person$.acceptTerm) {
			this.userService.register(
				this.person$.email,
				this.person$.password,
				this.person$.fullName,
        this.person$.avatar,
			);
      this.router.navigate(['/main'])
		}
	}
}
