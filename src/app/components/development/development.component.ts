import { Component } from '@angular/core';

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.css']
})
export class DevelopmentComponent {

  mobile = window.innerWidth < 720
}
