import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Notification } from '../models/notification';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  notification: Notification;

  constructor(
    private messagingService: MessageService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.messagingService.requestPermission();
    this.messagingService.receiveMessage();
    this.messagingService.getCurrentMessage.subscribe(message => {
      if (message) {
        this.notification = message.notification;
        this.ref.detectChanges();
        console.log(this.notification);
      }
    });
  }
}
