import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, startWith } from 'rxjs';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import Swal from 'sweetalert2';
import { newGlobalData } from '../newGlobaldata';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent {

  image = ''
  dataUser:any = {}
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
  fingerprints:any[] = []

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
  loading_delete = false
  loading_fingers = true
  setEventState = true
  id_finger:number | null = null
  face = {}
  size = 300

  constructor(public dialogRef: MatDialogRef<UserEditComponent>, private home:HomeService, @Inject(MAT_DIALOG_DATA) public data: any, private http:newHttpRequest) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  ngOnInit(){
    newGlobalData.run()
    this.dataUser = newGlobalData.dataUser
    this.form.controls.id.setValue(this.data.id)
    this.form.controls.deviceid.setValue(this.data.device_id)
    if(Number(this.data.id)){
      this.form.controls.name.setValue(this.data.name)
      this.form.controls.userid.setValue(this.data.userid)
      this.form.controls.password.setValue(this.data.password)
      this.form.controls.card.setValue(this.data.card)
      this.form.controls.type.setValue(this.data.priority)
      this.form.controls.valid.setValue(this.data.verify)
      if(this.data.imagen){
        this.image = this.data.imagen
        this.getImg()
      }
    }
  }


  getImg(){
    this.http.post('device/image/get', {deviceid: this.form.controls.deviceid.value, userid: this.form.controls.userid.value}).then((res:any)=>{
      console.log(res)
      if(res?.length > 0){
        this.image = res[0].face
        this.face = res[0]
      }
    }).catch((err:any)=>{
      
    })
  }

  setEventF(){
    if(this.setEventState){
      this.setEventState = false
      for(var i = 0; i < 10; i++){
        var finger = document.getElementById('Finger'+i)
        if(finger) finger.style.cursor = 'pointer'
        finger?.setAttribute('value', i.toString())
        finger?.addEventListener('click', (e:any)=>{
          var finger_id = Number(e.target.getAttribute('value'))
          var finger_exists = this.fingerprints.find((f:any)=>f.finger == finger_id)
          if(!finger_exists){
            for(var ii = 0; ii < 10; ii++){
              var finger = document.getElementById('Finger'+ii)
              var exists = this.fingerprints.find((f:any)=>f.finger == ii)
              if(!exists && finger) finger.style.fill = 'transparent'
            }
            if(this.id_finger != finger_id){
              this.id_finger = finger_id
              e.target.style.fill = this.dataUser.color_secondary
            }else this.id_finger = null
          }
        })
      }
    }
  }

  changeTab(tab:string){
    this.view = tab
    if(tab == 'fingerprint' && this.fingerprints.length == 0) this.load_fingerprint()
    else if(tab == 'face'){
      setTimeout(() => {
        var face = document.getElementById('face')
        var width = face?.offsetWidth ?? 1000
        if(width < 300) this.size = width - 30
      }, 250);
    }
  }

  load_fingerprint(){
    this.http.get('device/fingerprint/get?deviceid='+this.form.controls.deviceid.value+'&userid='+this.form.controls.userid.value).then((res:any)=>{
      this.fingerprints = res
      this.loading_fingers = false
      this.setEventF()
      setTimeout(() => {
        for(var x of this.fingerprints){
          var finger = document.getElementById('Finger'+x.finger)
          if(finger){
            var fecha = new Date(x.date_create)
            finger.title = 'Creado el '+fecha.toLocaleDateString()+' a las '+fecha.toLocaleTimeString() 
            finger.style.fill = this.dataUser.color_tertiary
          }
        }
      }, 250);
    }).catch((err:any)=>{
      this.loading_fingers = false
    })
  }

  save_fingerprint(){
    if(!this.loading){
      this.loading = true
      var body = {action: 'fingerprint', id: Number(this.form.controls.deviceid.value), userid: Number(this.form.controls.userid.value), value: this.id_finger}
      this.http.post('device/process/options', body).then((res:any)=>{
        this.loading = false
        this.id_finger = null
        for(var ii = 0; ii < 10; ii++){
          var finger = document.getElementById('Finger'+ii)
          var exists = this.fingerprints.find((f:any)=>f.finger == ii)
          if(!exists && finger) finger.style.fill = 'transparent'
        }
        this.home.toast.fire({icon:'success', title:'Solititud enviada correctamente'})
      }).catch((err:any)=>{
        this.loading = false
      })
    }
  }

  getStatus(finger:number){
    var exists = this.fingerprints.find((f:any)=>f.finger == finger)
    if(exists) return true
    return false
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

  remove(){
    this.home.alert({icon:'warning', title:'Eliminar empleado del biometrico', text:'Si se elimina al empleado, ya no podrá registrar más entradas. Sin embargo, las marcaciones anteriores no se perderán.'}).then((resp:any)=>{
      this.loading_delete = true
      var body = {action: 'delete', id: 0, deviceid: Number(this.form.controls.deviceid.value), userid: Number(this.form.controls.userid.value), name: '', password: '', card: '', type: 0, valid: 0}
      this.http.post('device/users/options', body).then((res: any) => {
        this.loading_delete = false
        this.home.toast.fire({ icon: 'success', title: 'Eliminado correctamente' })
      }).catch((err: any) => {
        this.loading_delete = false
      })
    })
  }
}