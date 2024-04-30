import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.css']
})
export class DevicesComponent {

  public property = ''
  order = ''
  timer:any = null
  old_search = ''
  text = new FormControl('')
  mobile = window.innerWidth < 601
  devices:any = []
  loading = false

  constructor(private router: Router, private http:newHttpRequest){}
  ngOnInit(){
    this.load_devices();
  }
  load_devices(){
    this.loading = true
    this.http.post('device/get', {device_id: 0, value: ''}).then((e:any)=>{
      for(let x of e){ if(x.image?.trim()?.length > 0){x.image = 'data:image/png;base64,' + x.image.trim()} }
      this.devices = e;
      for(let dev of this.devices){ 
        dev.last_communication = new Date(dev.last_communication.toString().slice(0, 18).replace('T', ' ')) 
        dev.last_record = new Date(dev.last_record.toString().slice(0, 18).replace('T', ' ')) 
      }
      this.valid_state();
      this.loading = false
    }).catch((e:any)=>{
      this.loading = false
    })
  }

  view(device:any){this.router.navigate(['devices', device.id, device.name])}

  add(){

  }

  changeOrder(property:string){
    if(this.property == property){
      if(this.order == 'asc'){ this.order = 'desc' }else{ this.order = 'asc' }
    }else{
      this.property = property;
      this.order = 'asc'
    }
    this.load_devices();
  }

  writing(){
    clearInterval(this.timer);
    this.timer = setInterval(()=>{
      if(this.text.value != this.old_search){ this.old_search = this.text.value ?? ''; this.load_devices() }
      clearInterval(this.timer);
    }, 600)
  }
  valid_state(){
    for(let dev of this.devices){
      var date2 = new Date();            
      var timeDiff = Math.abs(date2.getTime() - dev.last_communication.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 60));
      if(dev.clear || dev.data || dev.read_user || dev.reboot || dev.syncronize){
        dev.state_device = 'sync'
        if(diffDays > -1 && diffDays < 179){
          dev.state_device_title = 'Esperando respuesta'
          dev.state_device = 'sync'
        }else if(diffDays > 180){
          dev.state_device = 'sync_problem'
          dev.state_device_title = 'Equipo con posible problema de conexión'
        }
      }else{
        if(diffDays > -1 && diffDays < 180){
          dev.state_device_title = 'Sincronizado'
          dev.state_device = 'cloud_sync'
        }else if(diffDays > 180){
          dev.state_device = 'sync_disabled'
          dev.state_device_title = 'Equipo con problema de conexión.'
        }
      }
    }
  }
}
