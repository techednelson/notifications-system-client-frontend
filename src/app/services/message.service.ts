import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SubscriptionRequest } from '../models/subscription-request';
import { environment } from '../../environments/environment.prod';
import { Token } from '../models/token';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService implements OnDestroy {

  private baseURL = environment.baseURL;
  private subscriptions$: Subscription[] = [];
  private currentMessage = new BehaviorSubject(null);
  private subscriptionRequest: SubscriptionRequest;
  getCurrentMessage = this.currentMessage.asObservable();

  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  requestPermission(): void {
    const requestToken$ = this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        console.log(token);
        const tokens = [];
        tokens.push(token);
        this.subscriptionRequest = { topicName: 'client-b', tokens };
        const client$ = this.authService.getClient.subscribe(client => {
          if (client) {
            const credentials = btoa('');
            const httpHeaders = new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Basic ${ credentials }`
            });
            const http$ = this.httpClient.post(`${this.baseURL}/api/subscribe`, this.subscriptionRequest, { headers: httpHeaders })
              .subscribe(response => {
                console.log(response);
              });
            this.subscriptions$.push(http$);
          }
        });
        this.subscriptions$.push(client$);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
    this.subscriptions$.push(requestToken$);
  }

  receiveMessage(): void {
    const messages$ = this.angularFireMessaging.messages.subscribe(
      (payload) => {
        console.log('new message received. ', payload);
        this.currentMessage.next(payload);
      });
    this.subscriptions$.push(messages$);
  }

  ngOnDestroy(): void {
    if (this.subscriptions$.length > 0) {
      this.subscriptions$.forEach(subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
    }
  }
}
