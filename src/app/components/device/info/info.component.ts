import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoDComponent {

  mobile = window.innerWidth < 600
  device:any = {}
  copydata(val:string){
    navigator.clipboard.writeText(val).then(function() {
      console.log("Text copied to clipboard");
    }, function(err) {
      console.error("Could not copy text: ", err);
    });
  }

  languages = [
    {name: 'Español', value:'101'},
    {name: 'Ingles', value:'69'}
  ]

  constructor(private homesvc:HomeService, private http:newHttpRequest, private router_actived: ActivatedRoute, private router: Router){}

  ngOnInit(){
    var params:any = this.router_actived.snapshot.params;
    if (params?.id == undefined || params.id == '') {
      this.homesvc.toast.fire({icon:'error', title:'No se encontro el dispositivo biometrico'})
      this.router.navigate(['../devices'])
    } else {
      this.device = params
    }
    this.load()
  }

  load(){
    this.homesvc.loading.emit(true)
    console.log(this.device)
    this.http.post('device/get', {device_id: Number(this.device.id), value: ''}).then((e:any)=>{
      if(e.length > 0){
        this.device = e[0];
        console.log(this.device)
        var languaje = this.languages.find((l:any)=> l.value == this.device.language )
        console.log(languaje)
        if(languaje) this.device.language = languaje.name
      if(this.device.image) this.device.image = 'data:image/png;base64,' + e[0].image.trim()
        this.config()
      }
      this.homesvc.loading.emit(false)
    }).catch(()=>{
      this.homesvc.loading.emit(false)
    })
  }
  
  config(){
    this.device.last_communication = new Date(this.device.last_communication.toString().slice(0, 18).replace('T', ' '))
    var date2 = new Date();            
    var timeDiff = Math.abs(date2.getTime() - this.device.last_communication.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 60));
    if(this.device.clear || this.device.data || this.device.read_user || this.device.reboot || this.device.syncronize){
      this.device.state_device = 'sync'
      if(diffDays > 180){
        this.device.state_device = 'sync_problem'
        this.device.state_device_title = 'Equipo con posible problema de conexión'
      }else{
        this.device.state_device_title = 'Esperando respuesta'
        this.device.state_device = 'sync'
      }
    }else{
      if(diffDays > 180){
        // dev.state_device = 'sync_problem'
        this.device.state_device = 'sync_disabled'
        this.device.state_device_title = 'Equipo con problema de conexión.'
      }else{
        this.device.state_device_title = 'Sincronizado'
        this.device.state_device = 'cloud_sync'
      }
    }
  }
}
