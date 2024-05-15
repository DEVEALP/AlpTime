import { Component, Inject, Input, ViewChild } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DateRange, MatCalendar } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-assigned-turn',
  templateUrl: './assigned-turn.component.html',
  styleUrls: ['./assigned-turn.component.css'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' }]
})
export class AssignedTurnComponent {

  load_holidays = false
  days = [{ nombre: 'Lunes', state: true }, { nombre: 'Martes', state: true }, { nombre: 'Miércoles', state: true }, { nombre: 'Jueves', state: true }, { nombre: 'Viernes', state: true }, { nombre: 'Sábado', state: true }, { nombre: 'Domingo', state: true }, { nombre: 'Feriado', state: true }]
  max_date = new Date()
  turn: any
  turns: any[] = []
  holidays: any[] = []
  users: any[] = []
  tab = 1
  title = 'Selecionar turno'
  title_animation = false
  selection_sugerence = ''
  dateClass: any

  @Input() selectedRangeValue: DateRange<Date> | undefined;
  @ViewChild('calendar', {static: false}) calendar: MatCalendar<Date> | undefined;
  loading = false

  constructor(private home: HomeService, public dialogRef: MatDialogRef<AssignedTurnComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private http:newHttpRequest) { 
        this.dateClass = (cellDate:Date, view:any) => {
      if (view === 'month') {
        const date = cellDate.toISOString().split('T')[0]
        var holy = this.holidays.find(x => x.date_start == date)  ;
        if(holy) return 'holidays-class' 
        else return ''
      }
  
      return '';
    };
  }

  ngOnInit(): void {
    this.max_date.setDate(this.max_date.getDate() - 45);
    this.turns = JSON.parse(JSON.stringify(this.data.turns))
    this.users = JSON.parse(JSON.stringify(this.data.users))
    this.getHolidays()
  }

    getHolidays() {
    this.http.get('vacation/holidays').then((data: any) => {
      this.holidays = data
      this.load_holidays = true
    }).catch(() => {
      this.home.toast.fire({ icon: 'error', title: 'Error al obtener los días festivos' })
    })
  }

  seletedSugerence(sugerence: string) {
    this.selection_sugerence = sugerence
    var start_date:Date | null = null;
    var end_date:Date | null = null;
    
    if (sugerence == '7days') {
      start_date = new Date()
      end_date = new Date()
      end_date.setDate(end_date.getDate() + 6);
    }else if (sugerence == 'week') {
      start_date = this.getNextMonday()
      end_date = new Date(start_date.getTime())
      end_date.setDate(end_date.getDate() + 6);
    }else if (sugerence == '15days') {
      start_date = new Date()
      end_date = new Date()
      end_date.setDate(end_date.getDate() + 14);
    }else if (sugerence == 'month') {
      start_date = new Date()
      end_date = new Date(start_date.getTime())
      end_date.setMonth(end_date.getMonth() + 1);
      end_date.setDate(end_date.getDate() - 1);
    }else if (sugerence == '3months') {
      start_date = new Date()
      end_date = new Date(start_date.getTime())
      end_date.setMonth(end_date.getMonth() + 3);
      end_date.setDate(end_date.getDate() - 1);
    }else if (sugerence == 'year') {
      start_date = new Date()
      end_date = new Date(start_date.getTime())
      end_date.setFullYear(end_date.getFullYear() + 1);
      end_date.setDate(end_date.getDate() - 1);
    }else if (sugerence == 'infinite') {
      start_date = new Date()
    }
    if(start_date) this.calendar?._goToDateInView(start_date, "month")
    this.selectedRangeValue = new DateRange<Date>(start_date, end_date);
    setTimeout(() => { 
      this.calendar?.updateTodaysDate();
      this.save() 
    }, 250);
  }

  getNextMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; 
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    return nextMonday;
    }

    formatearFecha(input?: string | Date | null) {
      let fecha;
      if(input == null) return ''
      if (typeof input === 'string') fecha = new Date(input);
      else if (input instanceof Date) fecha = input;
      else return 'Formato no válido'
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Sumar 1 porque los meses en JavaScript van de 0 a 11
      const año = fecha.getFullYear();
      const fechaFormateada = `${dia}/${mes}/${año}`;
      return fechaFormateada;
    }

  seleted_turn(turn: any) {
    this.turn = turn
    setTimeout(() => { this.save() }, 300);
  }

  getImageProfile(): any[] {
    var users = this.users.sort((a, b) => {
      if (a.imagen && !b.imagen) {
        return -1;
      } else if (!a.imagen && b.imagen) {
        return 1;
      } else {
        return 0;
      }
    })
    if (users.length > 4) users = users.slice(0, 4)
    return users
  }

  onselectedChange(date: Date): void {
    if (this.selectedRangeValue && this.selectedRangeValue.start && date >= this.selectedRangeValue.start && !this.selectedRangeValue.end) {
      this.selectedRangeValue = new DateRange(this.selectedRangeValue.start, date);
      this.save()
    } else {
      this.selectedRangeValue = new DateRange(date, null);
    }
    this.selection_sugerence = ''
  }

  
  lengthDays() {
    if (this.selectedRangeValue?.start && this.selectedRangeValue?.end) {
      var difference = this.selectedRangeValue.end.getTime() - this.selectedRangeValue.start.getTime()
      let days = Math.floor(difference / (1000 * 60 * 60 * 24));
      return days + 1
    }
    return 0
  }

  back() {
    var length_days = this.lengthDays()
    if (this.tab == 1) {
      if (this.turn) {
        this.home.alert({ icon: 'warning', title: '¿Desea cancelar la asignación de turno?' }).then((e: any) => { this.dialogRef.close() })
      } else this.dialogRef.close();
    }else if(this.tab == 4 && length_days <= 3 && this.selection_sugerence != 'infinite') this.tab = this.tab - 2
    else this.tab--
    this.setTitle()
  }

  save() {
    if(this.loading) return
    if(this.tab == 1 && !this.turn){
      this.home.toast.fire({ icon: 'warning', title: 'Debe seleccionar un turno' })
      return 
    }
    if(this.tab == 2 && this.selection_sugerence == '' && (!this.selectedRangeValue || !this.selectedRangeValue.start)){
      this.home.toast.fire({ icon: 'warning', title: 'Debe seleccionar un rango de fechas' })
      return 
    }
    var length_days = this.lengthDays()
    if(this.tab == 2 && length_days <= 3 && this.selection_sugerence != 'infinite') this.tab++
    if (this.tab == 4){
      this.loading = true
      var days = ''
      for(let x of this.days) days += x.state ? x.nombre.substring(0, 2) : '00'
      var start:any = this.selectedRangeValue?.start ? this.selectedRangeValue.start.toISOString().substring(0, 10) : ''
      var end:any = this.selectedRangeValue?.end ? this.selectedRangeValue.end.toISOString().substring(0, 10) : ''
      if(this.selection_sugerence == 'infinite'){
        start = ''
        end = ''
      }
      var key = new Date().getTime().toString()
      var body = { action: 'add', turnid: this.turn.id, userid:0, users: this.users.map((e: any) => e.userid), days: days, start: start, end: end, key: key}
      if(body.users.length == 1) body.userid = body.users[0]
      this.http.post('turn/asing', body).then((e: any) => {
        if(e && e[0].code == 200){
          this.home.toast.fire({ icon: 'success', title: 'Turno asignado con exito' })
          this.dialogRef.close({})
        }else{
          this.home.toast.fire({ icon: 'error', title: e[0].message })
        }
        this.loading = false
      }).catch((e: any) => {
        this.loading = false
      })
    }else this.tab++
    this.setTitle()
  }

  obtenerNombreDiaSemana(fecha: Date) {
    let diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return diasSemana[fecha.getDay()];
  }

  getDatesSelected() {
    var dates:any[] = []
    var length_days = this.lengthDays()
    if(length_days > 3 || this.selection_sugerence == 'infinite') dates = this.days.filter((e: any) => e.state)
    else{
      if(this.selectedRangeValue?.start && this.selectedRangeValue?.end){
        var start = new Date(this.selectedRangeValue.start?.getTime() ?? 0)
        for (let fecha = start; fecha <= this.selectedRangeValue.end; fecha.setDate(fecha.getDate() + 1)) {
          dates.push({nombre: this.obtenerNombreDiaSemana(fecha), state: false})
        }
      }
    }
    return dates
  }

  setTitle() {
    this.title_animation = true
    setTimeout(() => {
      if (this.tab == 1) this.title = 'Selecionar turno'
      else if (this.tab == 2) this.title = 'Selecione las fechas'
      else if (this.tab == 3) this.title = 'Confirme los dias'
      else if (this.tab == 4) this.title = 'Asignar turno'
      this.title_animation = false
    }, 200);
  }
}
