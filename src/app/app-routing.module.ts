import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: localStorage.getItem('userId') ? 'home' : 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./home/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./home/signup/signup.module').then(m => m.SignupPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'upload',
    loadChildren: () => import('./pages/upload/upload.module').then( m => m.UploadPageModule)
  },
  {
    path: 'charts',
    loadChildren: () => import('./pages/charts/charts.module').then( m => m.ChartsPageModule)
  },
  {
    path: 'category',
    loadChildren: () => import('./home/category/category.module').then( m => m.CategoryPageModule)
  },
  {
    path: 'profile-modal',
    loadChildren: () => import('./profile-modal/profile-modal.module').then( m => m.ProfileModalPageModule)
  },
  {
    path: 'display-details/:index',
    loadChildren: () => import('./home/display-details/display-details.module').then(m => m.DisplayDetailsPageModule)
  },
  {
    path: 'security',
    loadChildren: () => import('./pages/security/security.module').then(m => m.SecurityPageModule)
  },
  {
    path: 'goals',
    loadChildren: () => import('./pages/goals/goals.module').then( m => m.GoalsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
