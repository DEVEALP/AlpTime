import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { newGlobalData } from '../newGlobaldata';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
export class ReportComponent {

  theme = false;

  constructor(private homeService: HomeService, private router: Router){}

  ngOnInit() {
    newGlobalData.run();
    this.theme = newGlobalData.theme;
    setTimeout(() => {this.homeService.loading.emit(false); }, 100);
  }

  redirect(url:string){
    this.router.navigate(['reports', url]);
  }


}