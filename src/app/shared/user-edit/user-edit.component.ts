import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { hideUserProfile, triggerPopUserProfile } from '../../state/actions/triggerComponents.actions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent {
  currentUser!: any
  subscription: Subscription = new Subscription();
  personAvatar!: string;
  avatars = [
		"./assets/img/img_profile/profile1.png",
		"./assets/img/img_profile/profile2.png",
		"./assets/img/img_profile/profile3.png",
		"./assets/img/img_profile/profile4.png",
		"./assets/img/img_profile/profile5.png",
		"./assets/img/img_profile/profile6.png",
	];
  avatarSelected!: string;
  showSelectAvatars: boolean = true;
  @ViewChild('fileInput') fileInput: any;

  constructor(private store:Store<any>, private userService: UserService){}

  ngOnInit(): void {
    const sub = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;  
      this.personAvatar = this.currentUser.avatar;    
    });
    this.subscription.add(sub);
    this.avatarSelected = this.currentUser.avatar;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();    
  }

  triggerShowHideSelectAvatars(){
    this.showSelectAvatars = !this.showSelectAvatars;
  }

  selectImage($event: any) {
		const file = $event.target.files[0];
    if (file) {
			//Keep real file to be oploaded
			// Mantener el archivo real para la subida
			this.avatarSelected = file;

			//Load the image in base64 to be showed
			// Cargar la imagen en base64 para mostrar una vista previa (opcional)
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.personAvatar  = e.target.result; //Only to show like preview view // Esto solo es para vista previa
      };
      reader.readAsDataURL(file);  //Read image in base64 format // Leer la imagen como base64 para previsualización
    }
  }

  selectAvatar(avatarURL: string){
    this.personAvatar = avatarURL;
  }

  openFile(){
		this.fileInput.nativeElement.click();
	}

  async savingImgAvatar(){
     // Verificar si `avatarSelected` es una URL de una de las imágenes en `avatars`
      const isPredefinedAvatar = this.avatars.includes(this.avatarSelected);
      if(isPredefinedAvatar){
        let idRef = await this.userService.findUserByField('uid',this.currentUser.uid);
        if(idRef){
          console.log(idRef.ref);
        }
        
      }else{
        console.log('is not');
      }
		// let avatarUrl: string = this.personAvatar;
    
		// if(this.avatarSelected){
		// 	const uploadResult   = await this.userService.uploadImage(this.avatarSelected, this.currentUser.fullName);
		// 	if(uploadResult  ){
		// 		avatarUrl = uploadResult
		// 	}
		// }
		// this.personAvatar = avatarUrl ;
	}

  async onSubmitEdit(editForm: NgForm){
    if (editForm.submitted && editForm.form.valid) {
      await this.userService.updateUser('uid', this.currentUser.uid, editForm.value);
      this.store.dispatch(triggerPopUserProfile());
      this.store.dispatch(hideUserProfile());
    }
  }

  triggerUserProfilePopUp(event: Event){
    event.stopPropagation();
    this.store.dispatch(triggerPopUserProfile());
    this.store.dispatch(hideUserProfile());
  }

}
