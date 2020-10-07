import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { Token } from '../models/token';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  user: User;
  loginForm: FormGroup;
  isLoginValid: boolean;
  private subscriptions$: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.buildLoginForm();
    this.isLoginValid = true;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.user = JSON.parse(JSON.stringify(this.loginForm.value));
      const login$ = this.authService.login(this.user).subscribe(
        (token: Token) => {
          if (token && token.access_token) {
            sessionStorage.setItem('access_token', token.access_token);
            this.isLoginValid = true;
            this.router.navigateByUrl('/home');
          }
        }, error => this.isLoginValid = false
      );
      this.subscriptions$.push(login$);
    }
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

  private buildLoginForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

}
