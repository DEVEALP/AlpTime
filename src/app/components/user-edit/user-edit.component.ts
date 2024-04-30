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

  image = {date_create: null, imagen: '../../../assets/notprofile.jpg'}
  mobile = window.innerWidth < 800
  user = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]),
    biometrico: new FormControl(''),
    grupo: new FormControl('', Validators.required),
    id: new FormControl<number | undefined>(undefined, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]),
    cedula: new FormControl('', [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')])
  })
  filteredOptions: any;

  constructor(public dialogRef: MatDialogRef<UserEditComponent>, private home:HomeService, @Inject(MAT_DIALOG_DATA) public data: any, private http:newHttpRequest) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  
  ngOnInit(){
    if(this.data.user?.imagen){
      this.image.imagen = this.data.user.imagen
      this.load()
    }
    this.user.controls.name.setValue(this.data.user?.name ?? '')
    this.user.controls.grupo.setValue(this.data.user?.grupo ?? '')
    this.user.controls.id.setValue(this.data.user?.userid ?? '')
    this.user.controls.cedula.setValue(this.data.user?.cedula ?? '')
    if(this.data.mode){ this.user.controls.id.disable() }
    this.user.controls.biometrico.setValue(this.data.device.name)
    this.user.controls.biometrico.disable()
    this.filteredOptions = this.user.controls.grupo.valueChanges.pipe(startWith(''), map(value => this._filter(value || '')));
  }

  load(){
    this.http.post('device/users/image/get', {deviceid: this.data.device.id, userid: this.data.user?.userid}).then((e:any)=>{
      if(e.length > 0){
        this.image = e[0]
        this.image.imagen = 'data:image/jpeg;base64,' + this.image.imagen 
      }
    }).catch(()=>{})
  }

  remove(){
    Swal.fire({
      title: 'Seguro desea eliminar?',
      text: "Se eliminara el usuario del dispositivo",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) this.dialogRef.close({action: 'delete', data:null});
    })
  }

  save(){
    this.user.controls.id.enable()
    var data:any = this.user.value
    console.log(data)
    var code_group = this.data.groups.find((g:any)=> g.nombre.trim() == data.grupo.trim() )
    if(code_group){
      data.grupo_name = data.grupo
      data.grupo = code_group.codigo
      data.mode = this.data.mode ? 2 : 1
      data.deviceid = this.data.device.id
      this.dialogRef.close({action: 'save', data:data});
    }else{
      if(this.data.mode) this.user.controls.id.disable()
      this.user.controls.grupo.setValue('')
      this.home.toast.fire({icon:'error', title:'Selecione un grupo'})
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.data.groups.filter((option:any) => option.nombre.toLowerCase().includes(filterValue));
  }
}
