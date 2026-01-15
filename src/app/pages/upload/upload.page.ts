import { Component, inject, input } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ExpenseService } from 'src/app/services/expense-service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.page.html',
  styleUrls: ['./upload.page.scss'],
  standalone: false
})
export class UploadPage {
 
  
image!: string | undefined;

  private router = inject(Router);
  
  async uploadImage(){
      try{
      const permission = await Camera.checkPermissions();
      const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      source :CameraSource.Prompt,
      resultType: CameraResultType.Uri
    });
      console.log(image); 
      this.image =image.webPath;
    }catch(e){
      console.log(e)
    }   
     
    }

}
