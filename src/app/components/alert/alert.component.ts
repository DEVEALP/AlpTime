import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { newGlobalData } from '../newGlobaldata';
export type icon_notificationsInterface = 'success' | 'error' | 'warning' | 'info' | 'deny'
export type inputTypeAlertInterface = 'password' | 'text' 
export interface AlertInterface {
  width?:number,
  title:string,
  text?:string,
  timer?:number,
  image?:string,
  hiddenButtonCancel?:boolean
  wait?:number,
  icon?:icon_notificationsInterface,
  check?:checkAlertInterface,
  input?:inputAlertInterface,
  select?:selectAlertInterface,
  button?:AlternativebuttonInterface,
  text_button?:string
  color_button?:string
  value_button?:any
} 
export interface AlternativebuttonInterface {
  color?:string,
  background?:string,
  text:string,
  value:any
}
export interface checkAlertInterface {
  default:boolean,
  text:string
}
export interface inputAlertInterface {
  required:boolean,
  label:string,
  value:string,
  hide?:boolean,
  type:inputTypeAlertInterface
}
export interface selectAlertInterface {
  required:boolean,
  label:string,
  value:string,
  values:any[]
}
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent {

  public dataUser:any = {id:0, username:'', name:'', profile:'', genero:'', theme:false, menu:false, rol_code:'', busines_name:'', busines_image:'', busines_code:'', color:'rgb(23, 102, 221)', color_dark:'rgb(0, 67, 168)', color_light:''}
  fontSize:number = 13
  icon = ''
  image = ''
  title = ''
  hide = true
  text = ''
  check:any = null
  input:any = null
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

  constructor(public dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) public data: AlertInterface) {
    
  }

  ngOnInit(): void {
    if(!this.data.color_button) this.data.color_button = newGlobalData.dataUser.color_primary
    if(this.data.timer){
      var inter = setInterval(() => {
        this.data.timer = (this.data.timer ?? 0) - 1000
        if(this.data.timer == 0) clearInterval(inter)
      }, 1000)
    }
    if(this.data.image == null && this.data.icon == 'success'){
      this.icon = '../../../assets/svg/icon_success.svg'
    }else if(this.data.image == null && this.data.icon == 'error'){
      this.icon = '../../../assets/svg/icon_error.svg'
    }else if(this.data.image == null && this.data.icon == 'warning'){
      this.icon = '../../../assets/png/icon_warning.png'
    }else if(this.data.image == null && this.data.icon == 'info'){
      this.icon = '../../../assets/png/icon_info.png'
    }else if(this.data.image == null && this.data.icon == 'deny'){
      this.icon = '../../../assets/svg/icon_deny.svg'
    }else{
      this.image = this.data.image ?? ''
    }
    this.title = this.data.title
    this.text = this.data.text ?? ''
    this.check = this.data.check;
    this.input = this.data.input;
    if(this.input?.type == 'password'){ this.hide = true }else{ this.hide = false }
    setTimeout(() => {
      document.getElementById('nextbtnalert')?.focus();
    }, 250);
  }


  closing(): void {
    this.dialogRef.close();
  }

  next_button(){
    this.dialogRef.close(this.data.button?.value);
  }

  next(){
    var data = this.data.value_button ?? {}
    if(this.check){data = {check:this.check?.default}}
    if(this.input && this.input?.required && this.input.value.trim() == ''){ this.toast.fire({icon: 'error', title: 'Campo de texto requerido' }); return; }
    if(this.input){ data = this.input; }
    this.dialogRef.close(data);
  }
}
