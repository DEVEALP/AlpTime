import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { newGlobalData } from '../newGlobaldata';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  @Input() title = ''
  @Input() urlReturn = ''
  @Input() loading = false
  @Input() eventReturn = false
  @Output() return_event = new EventEmitter<void>()
  hiddenMenu = false
  showMenu = false
  page = 'devices'
  version = ''
  mobile = true
  dataUser:any
  apps:any[] = []

  constructor(private router:Router, private actived_router:ActivatedRoute, private home:HomeService) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.mobile = true
  }

  logaut(){
    localStorage.removeItem('token')
    localStorage.removeItem('dataUser')
    this.router.navigate(['../auth'])
  }

  ngOnInit(): void {
    this.home.loading.subscribe((e: boolean) => this.loading = e)
    this.version = newGlobalData.version
    newGlobalData.run()
    this.apps = newGlobalData.apps
    this.dataUser = newGlobalData.dataUser
    var path = this.actived_router.snapshot.routeConfig?.path ?? 'devices'
    this.page = path.trim()?.split('/')[0]
    if(this.page == '' || this.page == 'device') this.page = 'devices'
    else if(this.page == 'attendance_delays') this.page = 'reports'
    else if(this.page == 'graph_graattendance_delays') this.page = 'reports'
    else if(this.page == 'delay_report') this.page = 'reports'
    else if(this.page == 'time_report') this.page = 'reports'
  }

  clickButton(){
    if(this.urlReturn.length > 0) this.back()
    else if(this.eventReturn) this.return_event.emit()
    else this.openMenu(!this.hiddenMenu)
  }

  back(){
    this.router.navigate([this.urlReturn])
  }

  openMenu(state: boolean){
    if(state){
      this.hiddenMenu = true
      setTimeout(() => { this.showMenu = true }, 100);
    }else{
      this.showMenu = false
      setTimeout(() => { this.hiddenMenu = false }, 400);
    }
  }

  setPage(page: string) {
    this.page = page
    this.router.navigate([page])
  }
}
