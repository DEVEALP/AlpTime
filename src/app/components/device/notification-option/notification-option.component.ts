import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, startWith } from 'rxjs';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-notification-option',
  templateUrl: './notification-option.component.html',
  styleUrls: ['./notification-option.component.css']
})
export class NotificationOptionComponent {

  tab = 1
  users:any[] = []
  users_seleted:any[] = []
  max_date = new Date()

  types = [{codigo: 253, nombre:'Todos'}, {codigo: 254, nombre:'Personalizado'}]
  options: string[] = ['5', '10', '15', '20', '30', '45', '60'];
  title = 'Nueva notificación';
  hidden_title = false
  timeOptions:any
  notification = new FormGroup({
    type: new FormControl(253),
    observation: new FormControl('', [Validators.required, Validators.minLength(3)]),
    time: new FormControl<string>('', [Validators.pattern('^[0-9]*$')])
  })
  search = ''
  loading_user = false
  loading = false
  selectedValue: Date | undefined
  time = {hour: 0, min: 0}

  constructor(private home:HomeService, private http:newHttpRequest, private dialogref:MatDialogRef<NotificationOptionComponent>, @Inject(MAT_DIALOG_DATA) public data:any) {}

  ngOnInit() {
    this.timeOptions = this.notification.controls.time.valueChanges.pipe(startWith(''), map(value => this._filter(value || '')));
    this.getUsers()
  }

  timer:any
  writing() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.getUsers()
      clearInterval(this.timer);
    }, 800)
  }

  validTime(event:any, type:string){
    var value = event.target.value
    if(value == '') return
    if(isNaN(Number(value))){
      this.home.toast.fire({icon: 'error', title: 'El tiempo debe ser un número'})
      event.target.value = ''
      return
    }
    if(Number(value) < 0){
      this.home.toast.fire({icon: 'error', title: 'El tiempo debe ser mayor a 0'})
      event.target.value = ''
      return
    }
    if(type == 'min' && Number(value) > 59){
      this.home.toast.fire({icon: 'error', title: 'El tiempo debe ser menor a 60'})
      event.target.value = ''
      return
    }
    if(type == 'hour' && Number(value) > 23){
      this.home.toast.fire({icon: 'error', title: 'El tiempo debe ser menor a 24'})
      event.target.value = ''
      return
    }
    event.target.value = Number(value).toString().padStart(2, '0')
    if(type == 'min') this.time.min = Number(value)
    if(type == 'hour') this.time.hour = Number(value)
  }

  onselectedChange(event:any){
    this.selectedValue = event
  }

  getTime():string{
    var time = this.time
    return time.hour.toString().padStart(2, '0') + ':' + time.min.toString().padStart(2, '0') + ' ' + (time.hour > 12 ? 'PM' : 'AM')
  }

  getNameUsers():string{
    if(this.notification.controls.type.value == 253) return 'Todos'
    else{
      var users = this.users_seleted.map((element:any) => element.name.split(' ')[0]).splice(0, 3)
      var faltantes = this.users_seleted.length - users.length
      var names = users.join(', ')
      return names + (faltantes > 0 ? (' y ' + faltantes + ' usuarios más') : '')
    }
  }

  selectedTime(e:any){
    e.target.select()
  }

  getUsers(){
    clearInterval(this.timer);
    this.loading_user = true
    this.http.post('device/users/get', {type: 'min', top: 10, deviceid: 2, search: this.search}).then((response:any) => {
      this.users = response
      this.loading_user = false
    }).catch((error:any) => {
      this.loading_user = false
    })
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  userSeleted(user:any){
    if(user.selected){
      var index = this.users_seleted.findIndex((element:any) => element.userid == user.userid)
      if(index > -1) this.users_seleted.splice(index, 1)
      user.selected = false
    }else{
      this.users_seleted.push(user)
      user.selected = true
    }
  }

  onCancel(){
    if(this.tab == 1) this.dialogref.close()
    else if(this.tab == 3 && this.notification.controls.type.value == 253) this.tab = 1
    else this.tab-- 
    if(this.tab == 1) this.setTile('Nueva notificación')
    else if(this.tab == 2) this.setTile('Seleccionar usuarios')
    else if(this.tab == 3) this.setTile('Fecha y hora de inicio')
  }

  onSave(){
    if(this.tab == 1){
      var data = this.notification.value
      if(data.type == 253 && data.time == ''){
        this.home.toast.fire({icon: 'error', title: 'Debe ingresar un tiempo'})
        return
      }
      if(data.type == 253 && isNaN(Number(data.time))){
        this.home.toast.fire({icon: 'error', title: 'El tiempo debe ser un número'})
        return
      }
      if(data.type == 253 && Number(data.time) <= 0){
        this.home.toast.fire({icon: 'error', title: 'El tiempo debe ser mayor a 0'})
        return
      }
      if(data.observation == ''){
        this.home.toast.fire({icon: 'error', title: 'Debe ingresar una observación'})
        return
      }
      if(data.type == 253){
        this.tab = 3
        this.setTile('Fecha y hora de inicio')  
      }else{
        this.tab = 2
        this.setTile('Seleccionar usuarios')
      }
    }else if(this.tab == 2){
      if(this.users_seleted.length == 0){
        this.home.toast.fire({icon: 'error', title: 'Debe seleccionar al menos un usuario'})
        return
      }
      this.tab = 3
      this.setTile('Fecha y hora de inicio')  
    }else if(this.tab == 3){
      if(this.selectedValue == undefined){
        this.home.toast.fire({icon: 'error', title: 'Debe seleccionar una fecha y hora'})
        return
      }
      if(this.time.hour == 0){
        this.home.toast.fire({icon: 'error', title: 'Debe seleccionar una hora'})
        return
      }
      this.selectedValue.setHours(this.time.hour)
      this.selectedValue.setMinutes(this.time.min)
      var date_now = new Date()
      date_now.setMinutes(date_now.getMinutes() + 3)
      if(this.selectedValue < date_now){
        this.home.toast.fire({icon: 'error', title: 'La hora debe ser mayor a 3 minutos de la actual'})
        return
      }
      this.tab = 4
      this.setTile('Crear notificación')
    }else if(this.tab == 4){
      this.loading = true
      var data = this.notification.value
      var body:any = {uid:'', device_id: this.data, tipo: data.type, details: data.observation, minutos: Number(data.time), time_run: ''}
      body.uid = this.home.tGenerate(8) + '-' + this.home.tGenerate(4) + '-' + this.home.tGenerate(4) + '-' + this.home.tGenerate(4) + '-' + this.home.tGenerate(12)
      body.time_run = this.selectedValue?.toISOString().split('T')[0] + ' ' + this.getTime().slice(0, 5) + ':00'
      body.users = this.users_seleted.reduce((acc:any, element:any) => { acc.push({userid: Number(element.userid), uid: body.uid}); return acc }, [])
      this.http.post('device/sms/set', body, ['object1']).then((response:any) => {
        this.loading = false
        this.home.toast.fire({icon: 'success', title: 'Notificación creada con éxito'})
        response.estado = 'Pendiente'
        response.for_user = this.types.find((element:any) => element.codigo == data.type)?.nombre
        response.details = data.observation
        response.desde = body.time_run
        var date_run = new Date(body.time_run)
        date_run.setMinutes(date_run.getMinutes() + Number(data.time))
        response.hasta = date_run.toISOString().replace('T', ' ').slice(0, 19)
        response.isDelete = true
        response.uid = body.uid
        this.dialogref.close(response)
      }).catch((error:any) => {
        this.loading = false
      })
    }
  }
  
  setTile(title:string){
    this.hidden_title = true
    this.title = title
    setTimeout(() => { this.hidden_title = false }, 50);
  }
}
