import { inject, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,FormsModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {
 
  private router = inject(Router);
  modalCtrl: any;

onLogout() {
  // Remove the saved keys
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  
  // Optionally clear everything
  // localStorage.clear(); 

  // Redirect back to login
  this.router.navigate(['/login'], { replaceUrl: true });
}

}
