import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private profileSubject = new BehaviorSubject<any>(null);
  profile$ = this.profileSubject.asObservable();
 
private API_URL = environment.apiUrl + '/profile';

   

  constructor(private http: HttpClient) {}

  // getUserProfile(userId: string): Observable<any> {
  //   return this.http.get(`${this.API_URL}/${userId}`);
  // }

  // updateProfile(userId: string, data: any): Observable<any> {
  //   return this.http.put(`${this.API_URL}/${userId}`, data);
  // }

 
  // updatePassword(userId: string, passwords: any): Observable<any> {
  //   return this.http.put(
  //     `${this.API_URL}/${userId}/change-password`,
  //     passwords
  //   );
  // }

  getUserProfile(userId: string) {
    return this.http.get(`${this.API_URL}/${userId}`).pipe(
      tap(profile => this.profileSubject.next(profile))
    );
  }

  updateProfile(userId: string, data: any) {
    return this.http.put(`${this.API_URL}/${userId}`, data).pipe(
      tap(profile => this.profileSubject.next({ ...this.profileSubject.value, ...data }))
    );
  }

updatePassword(userId: string, passwords: any) {
  return this.http.put(
    `${this.API_URL}/${userId}/change-password`,
    passwords
  );
}

}
