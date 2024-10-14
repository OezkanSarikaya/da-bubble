import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { UserService } from "../services/user.service";
import { Register } from "../interfaces/register";
import { Subscription } from "rxjs";
import { CommonModule } from "@angular/common";
import { MessageComponent } from "../shared/message/message.component";

@Component({
	selector: "app-avatar",
	standalone: true,
	imports: [RouterModule, FormsModule, CommonModule, MessageComponent], 
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
  showMessage: boolean = false;
  messageToShow: string = '';
  messages = {
    success: 'Konto erfolgreich erstellt',
    failed: 'E-Mail existiert bereits'
  }
	@ViewChild('fileInput') fileInput: any;

	constructor(private router: Router, private userService: UserService) {}

	ngOnInit(): void {
		const sub = this.userService.getUser().subscribe((p) => {
			this.person$ = p;
      this.person$.avatar = "./assets/img/profile.svg";
		});
		this.subscription.add(sub);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

  goBack(){
    this.userService.goBack();
  }

  selectAvatar(avatarURL: string){
    this.person$.avatar = avatarURL;
  }

  animationMessage(){
    this.showMessage = true;
    setTimeout(() => {
      this.showMessage = false;
    }, 2000);
  }

	async registerDataBase() {

		// if (this.person$.acceptTerm) {
		// 	const user = await this.userService.register(
		// 		this.person$.email,
		// 		this.person$.password,
		// 		this.person$.fullName,
    //     this.person$.avatar,
		// 	);
    //   if(user){
    //     this.messageToShow = this.messages.success;
    //     this.animationMessage();
    //     setTimeout(() => {
    //       this.router.navigate(['/'])
    //     }, 3000);
    //   }else{
    //     console.log('error');
    //     this.messageToShow = this.messages.failed;
    //     this.animationMessage();
    //   }
		// }
	}

	openFile(){
		this.fileInput.nativeElement.click();
	}

	uploadImage($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      this.userService.uploadImage($event); 
    }
  }
}
