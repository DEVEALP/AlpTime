import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-employe-biometric',
  templateUrl: './employe-biometric.component.html',
  styleUrls: ['./employe-biometric.component.css']
})
export class EmployeBiometricComponent {

  tab = 1
  devices: any[] = [];
  types = [
    { codigo: 0, nombre: "Empleado" },
    { codigo: 6, nombre: "Administrador del sistema" },
    { codigo: 14, nombre: "Super administrador" }
  ];
  validation = [
    { codigo: 0, nombre: "Cualquiera" },
    { codigo: 1, nombre: "Huella" },
    { codigo: 2, nombre: "Sólo ID de usuario" },
    { codigo: 3, nombre: "Contraseña" },
    { codigo: 4, nombre: "Sólo Tarjeta" },
    { codigo: 5, nombre: "Huella/Contraseña" },
    { codigo: 6, nombre: "Huella/Tarjeta" },
    { codigo: 7, nombre: "Contraseña/Tarjeta" },
    { codigo: 8, nombre: "ID usuario/Huella" },
    { codigo: 9, nombre: "Huella/Contraseña" },
    { codigo: 10, nombre: "Huella/Tarjeta" },
    { codigo: 11, nombre: "Huella/Contraseña/Tarjeta" },
    { codigo: 12, nombre: "Contraseña/Tarjeta" },
    { codigo: 13, nombre: "ID Usuario/Huella/Contraseña" },
    { codigo: 14, nombre: "Huella/Tarjeta/ID usuario" },
    { codigo: 15, nombre: "Sólo Rostro" },
    { codigo: 16, nombre: "Rostro/Huella" },
    { codigo: 17, nombre: "Rostro/Contraseña" },
    { codigo: 18, nombre: "Rostro/Tarjeta" },
    { codigo: 19, nombre: "Rostro/Huella/Tarjeta" },
    { codigo: 20, nombre: "Rostro/Huella/Contraseña" },
    { codigo: 21, nombre: "Vena" },
    { codigo: 22, nombre: "Vena/Contraseña" },
    { codigo: 23, nombre: "Vena/Tarjeta" },
    { codigo: 24, nombre: "Vena/Contraseña/Tarjeta" },
    { codigo: 25, nombre: "Palma" },
    { codigo: 26, nombre: "Palma/tarjeta" },
    { codigo: 27, nombre: "Palma/Rostro" },
    { codigo: 28, nombre: "Palma/Huella" },
    { codigo: 29, nombre: "Palma/Huella/Rostro" }
  ];
  form = new FormGroup({
    userid: new FormControl(null),
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚüÜ ]*$')]),
    password: new FormControl('', [Validators.pattern('^[0-9]*$')]),
    card: new FormControl('', [Validators.pattern('^[0-9]*$')]),
    type: new FormControl(0, [Validators.required]),
    valid: new FormControl(0, [Validators.required]),
  })
  device: any
  loading: boolean = false

  constructor(private http: newHttpRequest, private home: HomeService, private dialogref: MatDialogRef<EmployeBiometricComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.devices = this.data.devices.filter((e: any) => !e.userid)
    var name = this.data.employe.apellido?.trim() + ' ' + this.data.employe.nombre?.trim()
    this.form.controls.name.setValue(name)
    this.form.controls.userid.setValue(this.data.employe.userid)
  }

  back() {
    if (this.tab == 2) this.tab = 1
    else this.dialogref.close();
  }

  selectDevice(device: any) {
    if (!this.loading) this.device = device
  }

  next_tab() {
    if (this.tab == 1 && !this.device) {
      this.home.toast.fire({ icon: 'error', title: 'Seleccione un dispositivo' })
      return
    }
    if (this.tab == 2) {
      if (this.form.invalid) {
        this.home.toast.fire({ icon: 'error', title: 'Complete los campos correctamente' })
        return
      }
      if (this.device.warning == 1){
        this.home.alert({ icon: 'warning', title: 'Este dispositivo tiene problemas de conexión.', text: 'Se asignará al empleado una vez que se vuelva a conectar' }).then((result: any) => { this.save() }) 
      }else{ 
        this.save()
      }
    } else {
      this.tab = 2
    }
  }
  
  save() {
    if(this.form.valid){
      this.loading = true
      var body:any = this.form.value
      body.deviceid = this.device.id
      body.action = ''
      body.id = 0
      this.http.post('device/users/options', body, ['object1']).then((res: any) => {
        this.loading = false
        this.home.toast.fire({ icon: 'success', title: 'Empleado asignado correctamente' })
        this.dialogref.close(body.deviceid)
      }).catch((err: any) => {
        this.loading = false
      })
    }else{
      this.home.toast.fire({icon:'error', title:'Revise el formulario'})
    }
  }

}
