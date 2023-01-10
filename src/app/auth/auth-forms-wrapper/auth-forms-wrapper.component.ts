import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { AppErrorStateMatcher } from 'src/app/shared/helpers/error-state-matcher';

@Component({
  selector: 'app-auth-forms-wrapper',
  templateUrl: './auth-forms-wrapper.component.html',
  styleUrls: ['./auth-forms-wrapper.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {provide: ErrorStateMatcher, useClass: AppErrorStateMatcher}
  ]
})
export class AuthFormsWrapperComponent implements OnInit {
  authlinks = ['login', 'register'];
  activeLink = this.authlinks[0];
  
  activeButton: 'Login' | 'Register' = 'Login';

  constructor() { }

  ngOnInit(): void {
  }

  changeLink(link: string) {
    this.activeLink = link;

    this.activeButton = link === 'login' ? 'Login' : 'Register';
  }
}
