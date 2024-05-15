import { Component, Inject, Input, ViewChild } from '@angular/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-vacations-add',
  templateUrl: './vacations-add.component.html',
  styleUrls: ['./vacations-add.component.css']
})
export class VacationsAddComponent {

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
  periods: number[] = []

  period: any
  timer: any
  user: any
  dateClass: any

  @Input() selectedRangeValue: DateRange<Date> | undefined;
  selectedRangeWarning = { start: false, end: false }
  @ViewChild('calendar', { static: false }) calendar: MatCalendar<Date> | undefined;

  constructor(private http: newHttpRequest, private home: HomeService, public dialogRef: MatDialogRef<VacationsAddComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
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

  ngOnInit() {
    var date = new Date()
    var year = date.getFullYear()
    this.periods = [year, year - 1, year - 2, year - 3]
    this.setTitle()
    this.load_users()
    this.getHolidays()
  }

  setwarning() {
    this.selectedRangeWarning = { start: false, end: false }
    if (this.selectedRangeValue?.start && this.selectedRangeValue?.end) {
      var start_index = this.selectedRangeValue.start.getDay()
      var end_index = this.selectedRangeValue.end.getDay()
      var start_date_string = new Date(this.selectedRangeValue.start.getTime() - 86400000).toISOString().split('T')[0]
      var end_date_string = new Date(this.selectedRangeValue.end.getTime() + 86400000).toISOString().split('T')[0]
      var feriado_start = this.holidays.find((f:any)=> f.date_end == start_date_string || f.date_start == start_date_string)
      var feriado_end = this.holidays.find((f:any)=> f.date_end == end_date_string || f.date_start == end_date_string)
      if(end_index == 5 || feriado_end) this.selectedRangeWarning.end = true
      if(feriado_start) this.selectedRangeWarning.start = true
      if(start_index == 1 && !this.selectedRangeWarning.end) this.selectedRangeWarning.start = true
    }
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
      for (let x of this.users) x.userid = Number(x.userid)
      this.loading_users = false
    }).catch(() => {
      this.loading_users = false
    })
  }

  setPeriod(period: any) {
    this.period = period
    setTimeout(() => { this.tab++; this.setTitle() }, 400);
  }

  setUser(user: any) {
    this.user = user
    setTimeout(() => { this.tab++; this.setTitle() }, 400);
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
    if (!this.period && this.tab == 2) {
      this.home.toast.fire({ icon: 'error', title: 'Seleccione un periodo' })
      return
    }
    if ((!this.selectedRangeValue?.start || !this.selectedRangeValue?.end) && this.tab == 3) {
      this.home.toast.fire({ icon: 'error', title: 'Seleccione un rango de fechas' })
      return
    }
    if (this.tab >= 3) this.setwarning()
    if (this.tab > 3) {
      this.loading = true
      var start_date = this.selectedRangeValue?.start?.toISOString().split('T')[0] ?? ''
      var end_date = this.selectedRangeValue?.end?.toISOString().split('T')[0] ?? ''
      this.http.post('vacation/asing', { action: 'add', period: this.period, userid: this.user.userid, start: start_date, end: end_date }).then((e: any) => {
        this.loading = false
        this.home.toast.fire({ icon: 'success', title: 'Vacaciones asignadas con exito' })
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
      if (this.tab == 1) this.title = 'Seleccione un empleado'
      else if (this.tab == 2) this.title = 'Seleccione el periodo'
      else if (this.tab == 3) this.title = 'Seleccione el rango de fechas'
      else if (this.tab == 4) this.title = 'Asignar vacaciones'
      this.title_animation = false
    }, 200);
  }
}
