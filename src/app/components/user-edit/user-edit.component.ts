import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, startWith } from 'rxjs';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent {

  mobile = window.innerWidth < 800
  view = 'info'
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
    id: new FormControl<number>(0),
    deviceid: new FormControl<number>(0),
    userid: new FormControl(null),
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚüÜ ]*$')]),
    password: new FormControl('', [Validators.pattern('^[0-9]*$')]),
    card: new FormControl('', [Validators.pattern('^[0-9]*$')]),
    type: new FormControl(0, [Validators.required]),
    valid: new FormControl(0, [Validators.required]),
  })
  loading = false

  constructor(public dialogRef: MatDialogRef<UserEditComponent>, private home:HomeService, @Inject(MAT_DIALOG_DATA) public data: any, private http:newHttpRequest) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  ngOnInit(){
    this.form.controls.id.setValue(this.data.id)
    this.form.controls.deviceid.setValue(this.data.device_id)
    if(Number(this.data.id)){
      this.form.controls.name.setValue(this.data.name)
      this.form.controls.userid.setValue(this.data.userid)
      this.form.controls.password.setValue(this.data.password)
      this.form.controls.card.setValue(this.data.card)
      this.form.controls.type.setValue(this.data.priority)
      this.form.controls.valid.setValue(this.data.verify)
    }
  }

  save_info(){
    if(!this.loading){
      if(this.form.valid){
        this.loading = true
        var body:any = this.form.value
        body.action = ''
        this.http.post('device/users/options', body, ['object1']).then((res: any) => {
          this.loading = false
          this.home.toast.fire({ icon: 'success', title: 'Modificado correctamente' })
          this.dialogRef.close(body.name)
        }).catch((err: any) => {
          this.loading = false
        })
      }else{
        this.home.toast.fire({icon:'error', title:'Revise el formulario'})
      }
    }
  }
}