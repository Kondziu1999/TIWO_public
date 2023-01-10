import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { AuthService } from './../auth/service/auth.service';

@Component({
  selector: 'app-app-toolbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './app-toolbar.component.html',
  styleUrls: ['./app-toolbar.component.scss']
})
export class AppToolbarComponent {

  constructor(private authService: AuthService) { }

  logout(): void {
    this.authService.logOut().subscribe();
  }

}
