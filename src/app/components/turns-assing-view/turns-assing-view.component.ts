import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilterAssingTurnComponent } from '../filter-assing-turn/filter-assing-turn.component';
import { HomeService } from 'src/app/services/home.service';
import { MoveTurnComponent } from '../move-turn/move-turn.component';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-turns-assing-view',
  templateUrl: './turns-assing-view.component.html',
  styleUrls: ['./turns-assing-view.component.css']
})
export class TurnsAssingViewComponent {

  tab = 2
  filters_actived = 0
  mobile = window.innerWidth < 768

  filters: any = { area: null, job: null, office: null, turn: null, group: null, user: null }

  filters_laoding = true

  fechaActual = new Date()

  day_name = ''
  turn_name = ''
  turn_index = 0
  turn_view = 0
  day_view = 4
  width_hour = window.innerWidth / 23

  loading_calendar = false

  holidays: any[] = []
  turns_Calendar: any = []
  data_Calendar: any = []
  day_turns: any = []
  day_turns_back: any = []
  area: any = []
  job: any = []
  office: any = []
  turns: any = []
  groups: any = []
  colors: string[] = ['#44A2FF', '#B361FF', '#49C68D', '#E0C411', '#F67960', '#E23CE2', '#E15EA5', '#5E90E1', '#5FC2CC']
  date_now = ''

  nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  hours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']

  constructor(private dialog: MatDialog, private homesvc: HomeService, private http:newHttpRequest) { }

  ngOnInit(): void {
    if(this.width_hour < 50) this.width_hour = 60
    else this.width_hour = Math.floor(this.width_hour)
    this.date_now = this.obtenerNombreMes(this.fechaActual.getMonth()) + ', ' + this.fechaActual.getFullYear();
    this.day_name = this.nombresDias[this.fechaActual.getDay()]
    this.day_view = this.fechaActual.getDate()
    this.getFilters()
    this.setData()
    this.getHolidays()
  }

  getHolidays() {
    this.http.get('vacation/holidays').then((data: any) => {
      this.holidays = data
    }).catch(() => {})
  }

  setMonth(number: number) {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + number);
    this.date_now = this.obtenerNombreMes(this.fechaActual.getMonth()) + ', ' + this.fechaActual.getFullYear();
    this.setData()
  }
  
  addUserTurn(){
    var dialog = this.dialog.open(MoveTurnComponent, { data: { action:'add', turns: this.turns, user:null, fecha: this.fechaActual.toISOString().split('T')[0] }, 'width': '330px', disableClose: false, panelClass: 'asignUser' })
    dialog.afterClosed().subscribe((result: any) => {
      if (result) this.turns_Calendar.push(result)
    })
  }

  back_to_day(){
    this.tab = 2
    this.setData(this.day_turns_back)
  }

  view_next_turn(number:number){
    this.turn_index += number
    console.log(this.turn_index)
    var turn = this.day_turns[this.turn_index]
    if(turn){
      this.turn_view = turn.turnid
      this.turn_name = turn.turn_name
      this.setData()
    }
  }

  view_turn(turn:any, index:number){
    this.turn_view = turn.turnid
    this.turn_name = turn.turn_name
    this.turn_index = index
    this.tab = 3
    this.setData()
    console.log(turn)
  }

  changeUserTurn(user:any){
    var dialog = this.dialog.open(MoveTurnComponent, { data: { action:'change', turns: this.turns, user:user, fecha: this.fechaActual.toISOString().split('T')[0] }, 'width': '330px', disableClose: false, panelClass: 'asignUser' })
    dialog.afterClosed().subscribe((result: any) => {
      if (result) {
        var index = this.turns_Calendar.findIndex((e:any) => e.userid == user.userid)
        this.turns_Calendar.splice(index, 1)
      }
    })
  }

  async setData(data?:any[]){
    if(!data) data = await this.laod_data().catch(() => { return [] })
    if(this.tab == 1) this.generarCalendario(data)
    else if(this.tab == 2) this.generateCalendarDay(data)
    else if(this.tab == 3) this.generateCalendarTurn(data)
  }

  generateCalendarTurn(data:any){
    this.turns_Calendar = data
  }

  add_day(number:number){
    this.day_turns = []
    this.fechaActual.setDate(this.fechaActual.getDate() + number);
    this.day_view = this.fechaActual.getDate()
    this.day_name = this.nombresDias[this.fechaActual.getDay()]
    this.setData()
  }

  ngAfterViewInit() {
  }

  timeToMinutes(time: string): number {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    return hours * 60 + minutes;
  }

  generateCalendarDay(data:any[]) {
    console.log(data)
    this.day_turns_back = data
    var turnsid = data.map((e:any) => e.turnid).reduce((a:any, b:any) => a.includes(b) ? a : [...a, b], [])
    var data_day = []
    var index_colors:number[] = []
    for (let t of turnsid) {
      var users_turns = data.filter((e:any) => e.turnid == t)
      var presents = users_turns.filter((e:any) => e.present == 1).length
      var porcent = (presents * 100) / users_turns.length
      var turn_name = users_turns[0]?.turn_name
      var start_time = this.timeToMinutes(users_turns[0]?.time_start ?? '00:00')
      var end_time = this.timeToMinutes(users_turns[0]?.time_end ?? '00:00')
      start_time = (this.width_hour / 60) * start_time 
      end_time = (this.width_hour / 60) * end_time
      var width = end_time - start_time
      var porcent_width = (width / 100) * porcent 
      var color = ''
      while(true){
        var index_color = Math.floor(Math.random() * (this.colors.length - 0 + 1)) + 0
        var exist = index_colors.find((e:any) => e == index_color)
        color = this.colors[index_color]
        if(!exist && color){
          index_colors.push(index_color)
          break
        }
      }
      data_day.push({turnid: t, turn_name: turn_name, color:color, start_time:start_time, end_time:end_time, width:width, porcent: Number(porcent.toFixed()), porcent_width:porcent_width, users: users_turns})
    }
    this.day_turns = data_day
    var valores = this.day_turns.map((objeto:any) => objeto.start_time);
    var valorMaximo = Math.min(...valores);
    var daycont = document.getElementById('daycont')
    if(daycont) daycont.scrollLeft = (valorMaximo / 1.55)
  }

  return_month_calendar() {
    this.tab = 1
    this.day_view = 0
    this.day_turns = []
    this.generarCalendario(this.data_Calendar)
    this.setData()
  }

  private obtenerNombreMes(mes: number) {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return nombresMeses[mes];
  }

  laod_data = () => new Promise<any[]>((resolve, reject) => {
    var body = {
      action: '',
      year: this.fechaActual.getFullYear(),
      month: this.fechaActual.getMonth() + 1,
      day: this.day_view,
      group: this.filters.group ?? '',
      turnid: this.filters.turn ?? 0,
      userid: this.filters.user ?? 0,
      office: this.filters.office ?? '',
      departament: this.filters.area ?? '',
      cargo: this.filters.job ?? ''
    }
    if (this.tab == 1) body.action = 'month'
    else if (this.tab == 2) body.action = 'day'
    else if (this.tab == 3){ 
      body.action = 'turn'
      body.turnid = this.turn_view
    }
    this.loading_calendar = true
    this.http.post('turn/calendar/get', body).then((e:any) => {
      this.loading_calendar = false
      console.log(e)
      console.log(body)
      resolve(e)
    }).catch(() => {
      this.loading_calendar = false
      reject()
    })
  })

  private generarCalendario(data: any) {
    this.data_Calendar = data
    var container = document.getElementById('calendar')
    if(container == null){
      setTimeout(() => { this.generarCalendario(data) }, 1000);
      return
    }
    while (container.firstChild) { container.removeChild(container.firstChild); }
    const primerDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), 1).getDay();
    const ultimoDia = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth() + 1, 0).getDate();
    var semanas: any = [[]];
    let semanaActual = 0;

    for (let i = 0; i < primerDia; i++) semanas[semanaActual].push(null);

    for (let dia = 1; dia <= ultimoDia; dia++) {
      var day = {day_number: dia, turns: 0, users: 0}
      if (dia > 1 && (dia + primerDia) % 7 === 1) {
        semanaActual++;
        semanas[semanaActual] = [];
      }
      var fecha = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), dia).toISOString().split('T')[0];
      var data_day = data.find((e: any) => e.fecha == fecha)
      if(data_day){
        day.turns = data_day.turns
        day.users = data_day.users
      }
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
        week.style.borderBottom = '1px solid #616161'
        for (let d of s) {
          var classNameDay = 'calendarDay'
          relay += .5
          var day_element = document.createElement('div')
          day_element.style.borderLeft = '1px solid #616161'
          var number = document.createElement('div')
          number.className = 'numberDay color1'
          day_element.style.animationDelay = relay + 's !important'
          if(d){
            classNameDay += ' calendarDayHover'
            number.innerHTML = d.day_number
            var subcontainer = document.createElement('div')
            subcontainer.className = 'subcontainer'
            var fecha = new Date(this.fechaActual.getFullYear(), this.fechaActual.getMonth(), d.day_number).toISOString().split('T')[0];
            var holiday = this.holidays.find(x => x.date_start == fecha)
            if(d.users > 0){ subcontainer.appendChild(this.createElementDay(d.users, '#60ABEC', 'person', `El dia ${fecha} tiene ${d.users} empelados`)) }
            if(d.turns > 0){ subcontainer.appendChild(this.createElementDay(d.turns, '#13C4A9', 'event', `El dia ${fecha} tiene ${d.turns} turno`)) }
            if(holiday){ subcontainer.appendChild(this.createElementDay('', '#EBB51B', 'celebration', `Feriado: ` + holiday.nombre)) }
            day_element.appendChild(subcontainer)
            day_element.title = `${this.day_name} ${d.day_number} tiene ${d.users} empelados y ${d.turns} turnos`
            day_element.addEventListener('click', () => {
              this.tab = 2
              this.day_view = d.day_number
              this.fechaActual.setDate(d.day_number)
              this.setData()
            })
          }
          day_element.className = classNameDay
          day_element.appendChild(number)
          week.appendChild(day_element)
        }
        container.appendChild(week)
      }
    }
  }

  createElementDay(value:string, background:string, icon_text:string, title:string):HTMLElement{
    var day = document.createElement('div')
    day.className = 'day_element_info'
    day.style.background = background
    day.title = title
    
    var icon = document.createElement('span')
    icon.className = 'material-icons day_element_info_icon'
    icon.innerHTML = icon_text
    day.appendChild(icon)

    if(value.length > 0){
      var text = document.createElement('span')
      text.className = 'day_element_info_text' 
      text.innerHTML = value
      day.appendChild(text)
    }
    return day
  }

  async getFilters() {
    await this.getTurns()
    await this.getGroups()
    await this.getOptions()
    this.filters_laoding = false
  }

  getOptions = () => new Promise<void>((resolve, reject) => {
    this.http.get('device/options/get').then((e: any) => {
      for (let x of e) {
        if (x.tipo == "Area") this.area.push(x)
        if (x.tipo == "Cargo") this.job.push(x)
        if (x.tipo == "Oficina") this.office.push(x)
      }
      resolve()
    }).catch(() => {
      reject()
    })
  })

  getTurns = () => new Promise<void>((resolve, reject) => {
    this.http.post('turn/get', {value: ''}).then((e: any) => {
      this.turns = e
      resolve()
    }).catch(() => {
      reject()
    })
  })

  getGroups = () => new Promise<void>((resolve, reject) => {
    this.http.get('device/groups/get?value=').then((e: any) => {
      this.groups = e
      resolve()
    }).catch(() => {
      reject()
    })
  })

  getImageProfile(data:any[]): any[] {
    var users = data.sort((a, b) => {
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

  delete_turn(user:any){
    if(user.loading) return
    this.homesvc.alert({icon:'warning', title: 'Seguro desea continuar', text:`El usuario '${user.name}' perdera el turno '${user.turn_name}' el dia '${this.fechaActual.toISOString().split('T')[0]}'`}).then((result:any) => {
      user.loading = true
      var body = { action: 'delete', turnid: 0, userid:user.userid, users: [user.userid], days: '', start: this.fechaActual.toISOString().split('T')[0], end: this.fechaActual.toISOString().split('T')[0], key: 0}
      this.http.post('turn/asing', body).then((data:any) => {
        user.loading = false
        this.homesvc.toast.fire({icon: 'success', title: 'Turno eliminado correctamente'})
        if(data[0].code == 200){
          var index = this.turns_Calendar.findIndex((e:any) => e.userid == user.userid)
          this.turns_Calendar.splice(index, 1)
        }else{
          this.homesvc.toast.fire({icon: 'error', title: data[0].message})
        }
        console.log(data)
      }).catch(() => {
        user.loading = false
      })
    })
  }

  setFilters() {
    if (this.filters_laoding) return
    var open_dialog = this.dialog.open(FilterAssingTurnComponent, { data: { filter_users: true, filters: this.filters, calendar:[], area: this.area, job: this.job, office: this.office, groups: this.groups, turns: this.turns }, 'width': '320px', disableClose: true, panelClass: 'asignUser' })
    open_dialog.afterClosed().subscribe((result: any) => {
      if (result) {
        this.filters_actived = 0
        for (let key in result) if (result[key] != null) { this.filters_actived++ }
        this.filters = result
        this.setData()
      }
    })
  }

  formatearCapitalizarTexto(inputString: string) {
    var words = inputString?.trim()?.toLowerCase()?.split(' ')
    var texto = ''
    for (let word of words) texto += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
    return texto
  }
}
