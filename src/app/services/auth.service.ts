import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Token } from '../models/token';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseURL = environment.baseURL;
  private client = new BehaviorSubject<{ grant_type: string, username: string, password: string }>(null);


  constructor(private http: HttpClient) {
  }

  getClient = this.client.asObservable();

  setClient(client): void {
    this.client.next(client);
  }

  login(user: User): Observable<Token> {
    const endPoint = `${ this.baseURL }/oauth/token`;
    const credentials = btoa('');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${ credentials }`
    });
    const params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', user.username);
    params.set('password', user.password);
    this.client.next({ grant_type: 'password', username: user.username, password: user.password });
    return this.http.post<Token>(endPoint, params.toString(), {headers: httpHeaders});
  }
}
