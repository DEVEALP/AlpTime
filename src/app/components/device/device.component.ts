import { Component, ViewChild, ViewContainerRef  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../newGlobaldata';
import { HomeService } from 'src/app/services/home.service';
import { DeviceService } from 'src/app/services/device.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent {
  
  urlReturn = 'devices'
  loading = false
  dataUser:any
  groups:any = []
  mobile = window.innerWidth < 601
  device:any = {id:0, name:''}
  page = 'registers'
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: any;

  constructor(private router_actived:ActivatedRoute, private http:newHttpRequest, private home:HomeService, private router:Router, private devicesvc:DeviceService){}

  ngOnInit(){
    newGlobalData.run()
    this.dataUser = newGlobalData.dataUser
    var params:any = this.router_actived.snapshot.params;
    this.device.id = Number(params.id)
    if(params.name){
      this.device.name = params.name
    }else{
      this.loading = true
      this.page = ''
      this.http.post('device/get', {device_id: Number(this.device.id), value: 'get_name'}).then((e:any)=>{
        this.loading = false
        if(e.length > 0){
          this.device.name = e[0].name;
          if(this.devicesvc.view_user_biometric){ 
            this.page = 'users'
          }else{
            this.page = 'registers'
          }
        }else{
          this.home.toast.fire({icon:'error', title:'No se encontro el dispositivo biometrico'})
          this.router.navigate(['../devices'])
        }
      })
    }
    if(this.devicesvc.view_records) this.urlReturn = this.devicesvc.view_records.url
    else if(this.devicesvc.view_user_biometric) this.urlReturn = this.devicesvc.view_user_biometric.url
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
