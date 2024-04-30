import { Component, ViewChild, ViewContainerRef  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent {
  
  dataUser:any = {}
  groups:any = []
  mobile = window.innerWidth < 601
  device:any = {id:0, name:''}
  page = 'registers'
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: any;

  constructor(private router_actived:ActivatedRoute, private http:newHttpRequest){}

  ngOnInit(){
    var params:any = this.router_actived.snapshot.params;
    this.device.id = Number(params.id)
    this.device.name = params.name
    this.dataUser = JSON.parse(localStorage.getItem('dataUser') ?? '{}')
  }

  update_info(data:any){
    this.device.name = data.name;
    this.device.sn = data.sn;
    this.device.ip = data.ip;
    this.device.port = data.port;
    this.device.ubication = data.ubication;
    this.device.allow = data.enable;
    this.device.timezone = data.timezone;
  }

  createComponent(component: any) {
    if(this.container){
      this.container.clear();
      var componentRef = this.container.createComponent(component);
      const componentInstance = componentRef.instance;
      return componentInstance;
    }
  }
}
