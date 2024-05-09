import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { delay } from 'rxjs';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-calendar-user',
  templateUrl: './calendar-user.component.html',
  styleUrls: ['./calendar-user.component.css']
})
export class CalendarUserComponent {

  innerWidth = window.innerWidth
  mobile = this.innerWidth < 750
  date_now = ''
  day_name = ''
  loading = false;
  data_Calendar:any[] = []
  turns:any[] = []
  turns_days:any[] = []
  fechaActual = new Date()
  nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  colors: string[] = ['#44A2FF', '#B361FF', '#49C68D', '#E0C411', '#F67960', '#E23CE2', '#E15EA5', '#5E90E1', '#5FC2CC']

  constructor(private http:newHttpRequest, private router:Router) { }

  ngOnInit(): void {
    this.day_name = this.nombresDias[this.fechaActual.getDay()]
    this.date_now = this.obtenerNombreMes(this.fechaActual.getMonth()) + ', ' + this.fechaActual.getFullYear();
    this.generarCalendario()
    this.load()
  }

  load(){
    var body = {year: this.fechaActual.getFullYear(),month: this.fechaActual.getMonth() + 1, day: 0,group: '',turnid: 0,userid: 0,office: '',departament: '',cargo: '',action: 'user'}
    this.loading = true;
    this.http.post('turn/calendar/get', body).then((e:any) => {
      this.loading = false
      var index_colors:number[] = []
      this.turns = []
      this.turns_days = e
      for (let x of e){
        var exist_turn = this.turns.find((e:any) => e.id_turn == x.id_turn)
        if(!exist_turn) {
          while(true){
            var index_color = Math.floor(Math.random() * (this.colors.length - 0 + 1)) + 0
            var exist = index_colors.find((e:any) => e == index_color)
            x.color = this.colors[index_color]
            x.visible = true
            if(!exist && x.color){
              index_colors.push(index_color)
              break
            }
          }
          this.turns.push(x)
        }
      }
      this.generarCalendario()
    }).catch((e:any) => {
      this.loading = false
    })
  }

  
  setMonth(number: number) {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + number);
    this.date_now = this.obtenerNombreMes(this.fechaActual.getMonth()) + ', ' + this.fechaActual.getFullYear();
    this.load()
  }

  changeStatus(turn:any){
    turn.visible = !turn.visible
    this.generarCalendario()
  }

  private obtenerNombreMes(mes: number) {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return nombresMeses[mes];
  }

  private generarCalendario() {
    this.data_Calendar = this.turns_days
    var container = document.getElementById('calendar')
    if(container == null){
      setTimeout(() => { this.generarCalendario() }, 1000);
      return
    }
    while (container.firstChild) { container.removeChild(container.firstChild); }
    const primerDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1).getDay();
    const ultimoDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0).getDate();
    var semanas: any = [[]];
    let semanaActual = 0;

    for (let i = 0; i < primerDia; i++) semanas[semanaActual].push(null);

    for (let dia = 1; dia <= ultimoDia; dia++) {
      var day = {day_number: dia, now:false, color: '', turn: '', fecha:''}
      if (dia > 1 && (dia + primerDia) % 7 === 1) {
        semanaActual++;
        semanas[semanaActual] = [];
      }
      var fecha = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), dia).toISOString().split('T')[0];
      var data_day = this.turns_days.find((e: any) => e.date_day == fecha)
      if(data_day){
        var turn_data = this.turns.find((e:any) => e.id_turn == data_day.id_turn && e.visible)
        day.color = turn_data?.color
        day.turn = turn_data?.turn_name
        if(data_day.date_day == new Date().toISOString().split('T')[0]) day.now = true
      }
      day.fecha = fecha
      semanas[semanaActual].push(day);
    }
    const ultimaSemana = semanas[semanas.length - 1];
    while (ultimaSemana.length < 7) ultimaSemana.push(null);
    if (container) {
      var height = (container.clientHeight / semanas.length).toFixed() + 'px'
      container.innerHTML = '';
      var relay = 0
      for (let s of semanas) {
        var week = document.createElement('div')
        week.className = 'calendarWeek'
        week.style.height = height
        week.style.minHeight = height
        week.style.borderBottom = '1px solid rgba(200, 200, 200, 0.5)'
        var i = 0
        for (let d of s) {
          i++;
          var classNameDay = 'calendarDay'
          relay += .01
          var day_element = document.createElement('div')
          var number = document.createElement('div')
          number.className = 'numberDay color1'
          day_element.style.borderLeft = '1px solid rgba(200, 200, 200, 0.5)'
          if(i == s.length) day_element.style.borderRight = '1px solid rgba(200, 200, 200, 0.5)'
          if(d){
            classNameDay += ' calendarDayHover'
            var subcontainer = document.createElement('div')            
            subcontainer.className = 'subcontainer'
            day_element.appendChild(subcontainer)
            day_element.title = `${this.day_name} - ${d.turn}`
            var turn = document.createElement('div')
            turn.className = 'c_turn color1'
            if(d.color) turn.style.background=  d.color + '4D';
            if(d.now) turn.style.border = '1px solid #087CEF'
            turn.innerHTML = d.day_number
            day_element.appendChild(turn)
            day_element.addEventListener('click', () => {
              if(new Date(d.fecha + 'T05:00:00') <= new Date()) this.router.navigate(['/calendar_user', d.fecha])
            })
          }
          day_element.className = classNameDay
          day_element.style.animation = `opacity ease .4s ${relay}s forwards`
          // day_element.style.opacity = '1'
          day_element.appendChild(number)
          week.appendChild(day_element)
        }
        container.appendChild(week)
      }
    }
  }
  getNameDay(name:string){
    return name.slice(0, (this.mobile ? 3 : 50))
  }
}
