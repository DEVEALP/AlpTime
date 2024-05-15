import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { AlertComponent } from '../../alert/alert.component';
import { ActivatedRoute, Router } from '@angular/router';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { HomeService } from 'src/app/services/home.service';
import { newGlobalData } from '../../newGlobaldata';

@Component({
  selector: 'app-device-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class deviceSettingsComponent {

  device:any = {id:0, name:''} 
  calendar = true
  dialog = false
  types = [{name:'Periodo', value:'time'}, {name:'Todo', value:'all'}]
  toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  actions_buttons:any = []

  constructor(public dialogM: MatDialog, private actived_router:ActivatedRoute, private router:Router, private http:newHttpRequest, private home:HomeService){}

  ngOnInit(){
    var params:any = this.actived_router.snapshot.params;
    if(params.id) this.device = params
    else this.router.navigate(['/devices'])
  }


  loading_clear = false
  async clear(){
    console.log(newGlobalData.dataUser)
    this.home.alert({icon:'warning', title:'¿Está seguro de limpiar los datos?', text:'Esta acción no se puede deshacer, se borrarán todos los datos del dispositivo. Para continuar ingresé la contraseña de su cuenta.', timer: 5000, text_button:'Eliminar', color_button: '#D71111', input: {label: 'Contraseña', type: 'password', required: true, value: ''}}).then((e:any)=>{
      this.loading_clear = true
      this.http.post('device/process/options', {id:this.device.id, action:'clear', value: e.value, userid: newGlobalData.dataUser.id}).then((e:any)=>{
        this.loading_clear = false
        this.home.toast.fire({icon: 'success', title: 'Se está limpiando los datos' })
      }).catch((e:any)=>{
        this.loading_clear = false
        this.clear()
      })
    })
  }

  loading_user = false
  user_device(){
    this.loading_user = true
    this.http.post('device/process/options', {id:this.device.id, action:'query user', value: ''}).then((e:any)=>{
      this.toast.fire({icon: 'success', title: 'Se está cargando los usuarios' })
      this.loading_user = false
    }).catch((e:any)=>{
        this.loading_user = false
    })
  }

  loading_data = false
  data_device(){
    if(this.calendar && (!this.range.value.start || !this.range.value.end)){ 
      this.toast.fire({icon: 'error', title: 'Debe seleccionar un rango de fechas' })
      return 
    }
    this.loading_data = true
    var dates = this.range.value.start?.toISOString().substring(0, 19).replace('T', ' ') + ' ' + this.range.value.end?.toISOString().substring(0, 19).replace('T', ' ')
    this.http.post('device/process/options', {id:this.device.id, action:'data', value: dates}).then((e:any)=>{
      if(e && e.length > 0){
        if(e[0].code == 200) this.toast.fire({icon: 'success', title: 'Se está generando la sincronización de datos' })
        else this.toast.fire({icon: 'error', title: e[0].message})
      }else this.toast.fire({icon: 'error', title: 'No se pudo generar la sincronización de datos' })
      this.loading_data = false
    }).catch((e:any)=>{
        this.loading_data = false
    })
  }
  tGenerate(cant: number) {
    let caracteres = "abcdefghijkmnpqrtuvwxyz_ABCDEFGHJKMNPQRTUVWXYZ123467890-";
    let token = "";
    for (let i=0; i<cant; i++) {token += caracteres.charAt(Math.floor(Math.random()*caracteres.length));}
    return token; 
  }
  selectdType(type:any){
    if(type.value == 'time'){
      this.calendar = true
      this.range.controls.start.setValue(new Date())
      this.range.controls.end.setValue(new Date())
    }else{
      this.calendar = false
      this.range.controls.start.setValue(null)
      this.range.controls.end.setValue(null)
    }
  }

  loading_reboot = false
  reboot_device(){
    this.loading_reboot = true
    this.http.post('device/process/options', {id: this.device.id, action:'reboot', value:''}).then((e:any)=>{
      this.toast.fire({icon: 'success', title: 'Se envió la solicitud de reinicio' })
      this.loading_reboot = false
    }).catch((e:any)=>{
        this.loading_reboot = false
    })
  }

  loading_async = false
  sync_device(){
    this.loading_async = true
    this.http.post('device/process/options', {id: this.device.id, action:'check', value:''}).then((e:any)=>{
      this.toast.fire({icon: 'success', title: 'Se está generando la sincronización' })
      this.loading_async = false
    }).catch((e:any)=>{
        this.loading_async = false
    })
  }
}
