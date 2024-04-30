import { Component, Inject, Input, ViewChild } from '@angular/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-permission-add',
  templateUrl: './permission-add.component.html',
  styleUrls: ['./permission-add.component.css']
})
export class PermissionAddComponent {

  title = 'Selecione un empleado'
  old_user_search = ''
  user_search = ''

  title_animation = false
  loading = false
  loading_users = false
  load_holidays = false

  tab = 1
  users: any[] = []
  holidays: any[] = []
  time = {hour: 0, minute: 0}
  time_text = {hour: '', minute: ''}
  periods: number[] = []

  period: any
  timer: any
  user: any
  dateClass: any
  motives:string[] = [];

time_seleted = ''

motive = ''
details = ''

  @Input() selectedRangeValue: DateRange<Date> | undefined;
  @ViewChild('calendar', { static: false }) calendar: MatCalendar<Date> | undefined;

  constructor(private http: newHttpRequest, private home: HomeService, public dialogRef: MatDialogRef<PermissionAddComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.dateClass = (cellDate: Date, view: any) => {
      if (view === 'month') {
        const date = cellDate.toISOString().split('T')[0]
        var holy = this.holidays.find(x => x.date_start == date);
        if (holy) return 'holidays-class'
        else return ''
      }

      return '';
    };
  }

  setMotive(motivo: string) {
    this.motive = motivo
    this.details = ''; 
    setTimeout(() => {
      var textarea = document.getElementById(motivo)
      textarea?.focus()
    }, 500);
  }

  ngOnInit() {
    var date = new Date()
    var year = date.getFullYear()
    this.periods = [year, year - 1, year - 2, year - 3]
    this.setTitle()
    this.load_users()
    this.getHolidays()
    this.loadMotives()
  }

  loadMotives(){
    this.http.get('permission/motives/get').then((data:any)=>{
      for(let x of data) this.motives.push(x.motive)
    }).catch(()=>{
      this.home.toast.fire({icon:'error', title:'Error al obtener los motivos'})
      this.dialogRef.close()
    })
  }

    getHolidays() {
      this.http.get('vacation/holidays').then((data: any) => {
        this.holidays = data
        this.load_holidays = true
      }).catch(() => {
        this.home.toast.fire({ icon: 'error', title: 'Error al obtener los días festivos' })
      })
    }

    obtenerFeriadosPorMes(año: number, mes: number) {
      const feriadosEnMes: any[] = [];
      this.holidays.forEach(feriado => {
        const fechaFeriado = new Date(feriado.date_start.trim() + 'T05:00:00.000Z');
        if (fechaFeriado.getFullYear() === año && fechaFeriado.getMonth() === mes - 1) {
          feriadosEnMes.push(feriado);
        }
      });
      return feriadosEnMes;
    }

    onselectedChange(date: Date): void {
      if(this.selectedRangeValue && this.selectedRangeValue.start && date >= this.selectedRangeValue.start && !this.selectedRangeValue.end) {
      this.selectedRangeValue = new DateRange(this.selectedRangeValue.start, date);
      this.save()
    } else {
      this.selectedRangeValue = new DateRange(date, null);
    }
  }

  load_users() {
    clearInterval(this.timer);
    this.loading_users = true
    var search = this.user_search
    this.http.post('device/users/get', { type: 'min', deviceid: 0, search: search, top: 15 }).then((data: any) => {
      this.users = data
      console.log(data)
      for (let x of this.users) x.userid = Number(x.userid)
      this.loading_users = false
    }).catch(() => {
      this.loading_users = false
    })
  }

  setUser(user: any) {
    if(this.motive.trim().length > 0){
      this.home.alert({icon:'warning', title:'¿Está seguro de cambiar de empleado?', text:'Si cambia de empleado se perderá los datos seleccionado'}).then((e:any)=>{
        this.motive = ''
        this.details = ''
        this.selectedRangeValue = undefined
        this.time = {hour: 0, minute: 0}
        this.time_text = {hour: '', minute: ''}
        this.user = user
        this.setTitle()
        setTimeout(() => { this.tab++ }, 400);
      })
    }else{
      this.user = user
      this.setTitle()
      setTimeout(() => { this.tab++ }, 400);
    }
  }

  back() {
    if (this.tab == 1) {
      this.dialogRef.close();
    } else {
      this.tab--
    }
    this.setTitle()
  }

  save() {
    if(this.loading) return
    if (!this.user && this.tab == 1) {
      this.home.toast.fire({ icon: 'error', title: 'Seleccione un empleado' })
      return
    }
    if (!this.motive && this.tab == 2) {
      this.home.toast.fire({ icon: 'error', title: 'Seleccione un motivo' })
      return
    }
    if ((!this.selectedRangeValue?.start || !this.selectedRangeValue?.end) && this.tab == 3) {
      this.home.toast.fire({ icon: 'error', title: 'Seleccione un rango de fechas' })
      return
    }
    if (this.time.hour == 0 && this.time.minute == 0 && this.tab == 4) {
      this.home.toast.fire({ icon: 'error', title: 'Seleccione las horas del permiso' })
      return
    }
    if (this.tab > 4) {
      this.loading = true
      var start_date = this.selectedRangeValue?.start?.toISOString().split('T')[0] ?? ''
      var end_date = this.selectedRangeValue?.end?.toISOString().split('T')[0] ?? ''
      var body = { action: 'add', userid: this.user.userid, start: start_date, end: end_date, motive: this.motive, details:this.details, time: this.time_text.hour + ':' + this.time_text.minute}
      this.http.post('permission/asing', body).then((e: any) => {
        this.loading = false
        this.home.toast.fire({ icon: 'success', title: 'Permiso asignado' })
        this.dialogRef.close({})
      }).catch((e: any) => {
        this.loading = false
      })
    } else{
      this.tab++
      this.setTitle()
    }
  }

  lengthDays() {
    if (this.selectedRangeValue?.start && this.selectedRangeValue?.end) {
      var difference = this.selectedRangeValue.end.getTime() - this.selectedRangeValue.start.getTime()
      let days = Math.floor(difference / (1000 * 60 * 60 * 24));
      return days + 1
    }
    return 0
  }

  obtenerNombreDiaSemana(fecha: Date) {
    let diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return diasSemana[fecha.getDay()];
  }

  // Función para obtener el nombre del mes
  obtenerNombreMes(fecha: Date) {
    let meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses[fecha.getMonth()];
  }

  getWarning(date: Date | undefined | null) {

  }

  getFullDate(date: Date | undefined | null) {
    if (date) {
      let nombreDia = this.obtenerNombreDiaSemana(date);
      let dia = date.getDate();
      let nombreMes = this.obtenerNombreMes(date);
      let año = date.getFullYear();

      return `${nombreDia} ${dia} de ${nombreMes}, ${año}`;
    }
    return ''
  }

  writing_users() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.user_search != this.old_user_search) { this.old_user_search = this.user_search ?? ''; this.load_users() }
      clearInterval(this.timer);
    }, 600)
  }

  setTitle() {
    this.title_animation = true
    setTimeout(() => {
      if (this.tab == 1) this.title = 'Selecione un empleado'
      else if (this.tab == 2) this.title = 'Selecione el motivo'
      else if (this.tab == 3) this.title = 'Selecione el rango de fechas'
      else if (this.tab == 4) this.title = 'Selecione las horas del permiso'
      else if (this.tab == 5) this.title = 'Asignar permiso'
      this.title_animation = false
    }, 200);
  }

  setTime(time_string:string, hour:number){
    this.time_seleted = time_string
    this.time.hour = hour
    this.time.minute = 0
    this.time_text.hour = hour.toString().padStart(2, '0')
    this.time_text.minute = '00'
    setTimeout(() => { this.save() }, 400);
  }

  warning = ''
  validateTime(){
    if(Number(this.time_text.hour) < 0){
      this.time.hour = 0
      this.time_text.hour = '00'
    }
    if(Number(this.time_text.hour) > 8){
      this.time.hour = 8
      this.time_text.hour = '8'
    }
    if(Number(this.time_text.minute) < 0){
      this.time.minute = 0
      this.time_text.minute = '00'
    }
    if(Number(this.time_text.minute) > 59){
      this.time.minute = 59
      this.time_text.minute = '59'
    }
    this.time.hour = Number(this.time_text.hour)
    this.time.minute = Number(this.time_text.minute)
    if(this.time.hour == 8 && this.time.minute > 0){
      this.time.minute = 0
      this.time_text.minute = '00'
    }
    this.time_text.hour = this.time.hour.toString().padStart(2, '0')
    this.time_text.minute = this.time.minute.toString().padStart(2, '0')
  }
}

