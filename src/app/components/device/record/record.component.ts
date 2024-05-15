import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Observable, map, startWith} from 'rxjs';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import Swal from 'sweetalert2';
import { newGlobalData } from '../../newGlobaldata';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.css']
})
export class RecordComponent {

  users:any[] = []
  user = new FormControl()
  filteredOptions: Observable<any[]>| undefined;
  old_search = ''

  seletedUser:any = {}

  day:number | undefined 
  month:number | undefined 
  year:number | undefined 

  hour:number | undefined 
  minute:number | undefined 
  second:number | undefined 
  timer:any
  loading = false

  constructor(public dialogRef: MatDialogRef<RecordComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private homesvc:HomeService, private http:newHttpRequest) {}

  getUsers(){
    this.loading = true
    this.http.post('device/users/get', { type:'min', deviceid: this.data.deviceid, search: this.user.value, top: 5}).then((data: any) => {
      this.users = data
      this.filteredOptions = this.user.valueChanges.pipe(startWith(''), map((value:any) => this._filter(value || '')));
      this.loading = false
    }).catch(() => {
      this.loading = false
    })
  }

  writing() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.user.value != this.old_search) { this.old_search = this.user.value ?? ''; this.getUsers() }
      clearInterval(this.timer);
    }, 600)
  }

  private _filter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.users.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngOnInit(){
    newGlobalData.run()
    var date = new Date()
    if(this.data.record){
      this.user.setValue(this.data.record.name)
      this.user.disable()
      this.seletedUser = {Nombres: this.data.record.name, userid: this.data.record.userid}
      date = new Date(this.data.record.checktime)
    }
    this.day = date.getDate()
    this.month = date.getMonth() + 1
    this.year = date.getFullYear()
    this.hour = date.getHours()
    this.minute = date.getMinutes()
    this.second = date.getSeconds()
    this.valid()
    if(this.data.user){
      this.loading = true
      this.http.post('device/users/get', { type:'id', deviceid: this.data.deviceid, search: this.data.user, top: 5}).then((data: any) => {
        if(data.length == 1){
          this.seletedUser = data[0]
          this.user.setValue(this.seletedUser.name)
          this.homesvc.toast.fire({icon:'info', title:'Usuario seleccionado por el filtro'})
        }else{ this.homesvc.toast.fire({icon:'error', title:'Usuario no encontrado'}) }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    }
  }



  btnValid = false

  valid(valid:boolean = false){
    var string_date = this.month + '-' + this.day + '-' + this.year + ' ' + this.hour + ':' + this.minute + ':' + this.second
    this.btnValid = false
    if(this.day && (this.day > 31 || this.day < 0)){
      this.day = undefined
      this.homesvc.toast.fire({icon:'error', title:'Dia invalido'})
      return
    }
    if(this.month && (this.month > 12 || this.month < 0)){
      this.month = undefined
      this.homesvc.toast.fire({icon:'error', title:'Mes invalido'})
      return
    }
    if(this.year && (this.year > 2030 || this.year < 2020)){
      this.year = undefined
      this.homesvc.toast.fire({icon:'error', title:'Año invalido'})
      return
    }
    if(this.hour && (this.hour > 23 || this.hour < 0)){
      this.hour = undefined
      this.homesvc.toast.fire({icon:'error', title:'Hora invalido'})
      return
    }
    if(this.minute && (this.minute > 59 || this.minute < 0)){
      this.minute = undefined
      this.homesvc.toast.fire({icon:'error', title:'Minutos invalido'})
      return
    }
    if(this.second && (this.second > 59 || this.second < 0)){
      this.second = undefined
      this.homesvc.toast.fire({icon:'error', title:'Segundos invalido'})
      return
    }
    if(!this.seletedUser.userid){
      if(valid) this.homesvc.toast.fire({icon:'error', title:'Selecione un usuario'})
      return
    }
    if (isNaN(new Date(string_date).getTime())) {
      this.homesvc.toast.fire({icon:'error', title:'La fecha no es valida'})
      return; 
    }
    if(this.year && this.month && this.day){
      let ultimoDiaDelMes = new Date(this.year, this.month, 0).getDate();
      if (this.day < 1 || this.day > ultimoDiaDelMes) {
        this.homesvc.toast.fire({icon:'error', title:'La fecha no es valida'})
        return; 
      }
    }
    this.btnValid = true
  }

  save(){
    this.valid()
    if(this.seletedUser.userid){
      var date = this.year + '-' + this.month + '-' + this.day + ' ' + this.hour?.toString().padStart(2, '0') + ':' + this.minute?.toString().padStart(2, '0') + ':00'
      var data = {action: 'add', datetime: date, deviceid: this.data.deviceid, userid: this.seletedUser.userid, id: this.data.record?.id ?? 0}
      this.dialogRef.close(data);
    }
  }

  deleteItem(): void {
    Swal.fire({
      title: "Seguro desea continuar?",
      text: "Se eliminara el registro de marcacion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, borrar!"
    }).then((result) => {
      if (result.isConfirmed) {
        var data = {action: 'delete', datetime: '', deviceid: this.data.deviceid, userid: this.seletedUser.userid, id: this.data.record.id}
        this.dialogRef.close(data);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
