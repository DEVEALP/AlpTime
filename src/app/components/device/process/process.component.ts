import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent {

  process: any[] = []
  value = ''
  old_search = ''
  device: any = {}
  timer:any

  constructor(private homesvc: HomeService, private http:newHttpRequest, private router_actived: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    var params: any = this.router_actived.snapshot.params;
    if (params?.id == undefined || params.id == '') {
      this.router.navigate(['../devices'])
    } else {
      this.device = params
    }
    this.load()
  }

  writing() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.value != this.old_search) { this.old_search = this.value ?? ''; this.load() }
      clearInterval(this.timer);
    }, 600)
  }

  load() {
    this.homesvc.loading.emit(true)
    this.http.post('device/process/get', { device_id: Number(this.device.id), value: this.value }).then((e: any) => {
      this.homesvc.loading.emit(false)
      this.process = e
      console.log(this.process)
      for (let x of this.process) {
        x.date_process = x.date_process.replace('Z', '')
        if(x.state_process == 'slope') x.state = 'Pendiente'
        else if(x.state_process == 'complete') x.state = 'Completado'
        else if(x.state_process == 'progress') x.state = 'En progreso'
        else x.state = 'Cancelado'
        if(x.command.includes('DATA UPDATE SMS')){
          var datos = this.convert(x.command, 'DATA UPDATE SMS')
          x.action = 'Creo un mensaje ' + (datos.TAG == '254' ? 'privado' : 'publico') + ': ' + datos.MSG  
        }else if (x.command.includes('DATA UPDATE USERINFO')) {
          var datos = this.convert(x.command, 'DATA UPDATE USERINFO')
          x.action = 'Actualizar información del usuario ' + datos?.Name
        } else if (x.command.includes('DATA QUERY USERINFO')) {
          x.action = 'Obtener lista de usuarios'
        } else if (x.command.includes('DATA DELETE USERINFO')) {
          var datos = this.convert(x.command, 'DATA DELETE USERINFO')
          x.action = 'Eliminar usuario con userid ' + datos.PIN
        } else if (x.command.includes('DATA QUERY ATTLOG')) {
          var datos = this.convert(x.command, 'DATA QUERY ATTLOG')
          x.action = 'Obtener registros'
          if (datos.StartTime) x.action = x.action + ' desde ' + datos.StartTime.split(' ')[0]
          if (datos.EndTime) x.action = x.action + ' hasta ' + datos.EndTime.split(' ')[0]
        } else if (x.command.includes('INFO')) {
          x.action = 'Verificar conexión con el biométrico'
        } else if (x.command.includes('SET OPTION VOLUME')) {
          var volumen = x.command.split('=')[1]
          x.action = 'Establecer volumen del dispositivo al ' + volumen + '%'
        } else {
          x.action = x.command
        }
      }
    }).catch(() => {
      this.homesvc.loading.emit(false)
    })
  }

  cancel(process: any) {
    Swal.fire({
      title: "Cancelar proceso",
      text: "Se cancelará la solicitud realizada al biométrico",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, cancelar!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.homesvc.loading.emit(true)
        this.http.post('device/process/options', { action: 'cancel', id: process.id, value:'' }).then((e: any) => {
          process.state_process = 'cancel'
          this.homesvc.toast.fire({ icon: 'success', title: 'Cancelado con exito' })
          this.homesvc.loading.emit(false)
        }).catch(() => {
          this.homesvc.loading.emit(false)
        })
      } 
    })

  }

  convert(inputString: string, restar: string) {
    const dataString = inputString.replace(restar, '');
    const keyValuePairs = dataString.replace(/\t/g, "\\t").split('\\t')
    const resultObject: any = {};
    keyValuePairs.forEach(pair => {
      const [key, value] = pair.split('=');
      resultObject[key?.trim()] = value?.trim();
    });
    return resultObject;
  }

}
