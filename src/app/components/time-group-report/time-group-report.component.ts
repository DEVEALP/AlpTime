import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GeneratorReportExcel } from 'src/app/services/ReportExcel';
import { GeneratorReportPdfV2, ItemConfigInterface } from 'src/app/services/ReportV2';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../newGlobaldata';
import { TurnsService } from 'src/app/services/turns.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FilterAssingTurnComponent } from '../filter-assing-turn/filter-assing-turn.component';

@Component({
  selector: 'app-time-group-report',
  templateUrl: './time-group-report.component.html',
  styleUrls: ['./time-group-report.component.css']
})
export class TimeGroupReportComponent {

  dataUser:any = {}
  mobile = window.innerWidth < 700

  filters_laoding = true
  view_graph = false
  loading = false
  menzualizado = true
  filters_actived = 0

  start = new FormControl(this.getFirstDayOfMonth())
  end = new FormControl(new Date())
  date = new FormControl('')

  records: any[] = []
  area: any = []
  job: any = []
  office: any = []
  turns: any = []
  groups: any = []
  settings: any = {}

  timmerLoad: any
  filters: any = { area: null, job: null, office: null, turn: null, group: null, user: null }

  constructor(private homesvc: HomeService, private http:newHttpRequest, private turnsvc:TurnsService, private router:Router, private dialog:MatDialog) { }

  ngOnInit() {
    newGlobalData.run()
    this.dataUser = newGlobalData.dataUser
    var app:any = newGlobalData.apps.find((x: any) => x.route_path == 'reports')
    if (app) try{ this.settings = JSON.parse(app.settings) }catch(e){}
    if(this.menzualizado) this.setMonthAndYear(new Date(new Date().getFullYear(), new Date().getMonth(), 1), { close: () => { } })
    this.load_data()
    this.getFilters()
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

  viewUser(data:any){
    this.homesvc.alert({icon:'info',title:'Desea ver el reporte detallado de este usuario?'}).then((result:any)=>{
      this.turnsvc.view_user_report = {userid: Number(data.userid), name: data.nombre}
      this.router.navigate(['reports', 'time_report'])
    })
  }

  setMonthAndYear(date_seleted: Date, datepicker: any) {
    datepicker.close();
    var date = date_seleted.toISOString()
    var parts = date.split('T')[0].split('-')
    this.date.setValue(parts[1] + '/' + parts[0])
    this.start.setValue(date_seleted)
    this.end.setValue(new Date(date_seleted.getFullYear(), date_seleted.getMonth() + 1, 0))
  }

  setFilters() {
    if (this.filters_laoding) return
    var open_dialog = this.dialog.open(FilterAssingTurnComponent, { data: { filter_users: true, filters: this.filters, calendar:[], area: this.area, job: this.job, office: this.office, groups: this.groups, turns: this.turns }, 'width': '320px', disableClose: true, panelClass: 'asignUser' })
    open_dialog.afterClosed().subscribe((result: any) => {
      if (result) {
        this.filters_actived = 0
        for (let key in result) if (result[key] != null) { this.filters_actived++ }
        this.filters = result
        this.load_data()
      }
    })
  }

  load_data() {
    if (this.start.value != null && this.end.value != null && this.end.value.getTime() >= this.start.value.getTime()) {
      this.loading = true
      var start_date = this.start.value.toISOString().split('T')[0]
      var end_date = this.end.value.toISOString().split('T')[0]
      var body = { 
        start_date: start_date, 
        end_date: end_date, 
        userid: this.filters?.user ?? 0, 
        turnid: this.filters?.turn ?? 0,
        group: this.filters?.group ?? '',
        cargo: this.filters?.job ?? '',
        departamento: this.filters?.area ?? '',
        oficina: this.filters?.office ?? ''
      }
      this.http.post('report/general', body).then((e:any) => {
        this.loading = false
        if (e.length > 0) {
          var userids = e.reduce((result: string[], objeto: any) => { if (!result.find((u: string) => u == objeto.userid)) result.push(objeto.userid); return result; }, []);
          for (let userid of userids) {
            var data_user = e.filter((o: any) => o.userid == userid)
            var subtotals = data_user.map((o: any) => o.total)
            var atrasos = data_user.map((o: any) => o.atraso)
            var h25s = data_user.map((o: any) => o.h25)
            var permissions = data_user.map((o: any) => o.permiso)
            var vacations = data_user.map((o: any) => o.vacaciones)
            var h50s = data_user.map((o: any) => o.h50)
            var h100s = data_user.map((o: any) => o.h100)
            var faltas = data_user.map((o: any) => o.falta)
            var permisos_sum = this.sumarTiempos(permissions)
            var vacaciones_sum = this.sumarTiempos(vacations)
            var subtotals_sum = this.sumarTiempos(subtotals)
            var atrasos_sum = this.sumarTiempos(atrasos)
            var h25s_sum = this.sumarTiempos(h25s)
            var h50s_sum = this.sumarTiempos(h50s)
            var h100s_sum = this.sumarTiempos(h100s)
            var faltas_sum = this.sumarTiempos(faltas)
            var total_sum = this.sumarTiempos(subtotals.concat(permissions).concat(vacations))
            var record = { userid: userid, dias: data_user.length, nombre: data_user[0].nombres, total:total_sum, subtotal: subtotals_sum, vacaciones:vacaciones_sum, permisos:permisos_sum, atraso: atrasos_sum, falta: faltas_sum, h25: h25s_sum, h50: h50s_sum, h100: h100s_sum }
            this.records.push(record)
          }
          this.homesvc.toast.fire({ icon: 'success', title: `Se encontraron ${this.records.length} usuarios` })
        } else {
          this.homesvc.toast.fire({ icon: 'error', title: 'No se encontraron resultados' })
        }
      }).catch(() => {
        this.loading = false
      })
    } else {
      this.homesvc.toast.fire({ icon: 'error', title: 'Selecione un rango de fecha' })
    }
  }

  donwload_excel() {
    if (this.records.length == 0) {
      this.homesvc.toast.fire({ icon: 'error', title: 'No hay datos para descargar' })
      return
    }
    var excel = new GeneratorReportExcel()
    excel.addPage('Horas Trabajadas')
    excel.addColumnWidth('B', 35)
    excel.combinateColumns(['A1:H1', 'A2:H2', 'A3:H3'])
    excel.addText(this.dataUser.name_business, 'A1', { bold: true })
    excel.addText('Horas Trabajadas', 'A2', { bold: true })
    var text = `Fecha desde:        ${this.start.value?.toISOString().split('T')[0]}             Hasta:        ${this.end.value?.toISOString().split('T')[0]}`
    excel.addText(text, 'A3', undefined, [{ word: 'Fecha desde:', style: { bold: true } }, { word: 'Hasta:', style: { bold: true } }])
    excel.addTable(this.records)
    excel.download('Listado de Horas Atrasadas')
  }

  donwload_pdf() {
    if (this.records.length == 0) {
      this.homesvc.toast.fire({ icon: 'error', title: 'No hay datos para descargar' })
      return
    }
    var orientation:any = 'horizontal'
    orientation = this.settings.time_group?.orientation ?? 'horizontal'
    var report = new GeneratorReportPdfV2('Horas Trabajadas', true, orientation, 10)
    report.addFooterText(this.dataUser.name_business, 14, undefined, true, 'center', 'center', 4);
    report.addFooterText('Horas trabajadas', 14, undefined, true, 'center', 'center', 4);
    report.addFooterText(`<strong>Fecha desde:</strong><tab2>${this.start.value?.toISOString().split('T')[0]}<tab2><strong>Hasta:</strong><tab2>${this.end.value?.toISOString().split('T')[0]}`, 14, undefined, false, 'center', 'center', 4);
    var records = []
    for (let record of this.records) {
      var item = {codigo: record.userid, dias: record.dias, nombre: record.nombre, subtotal: record.subtotal, atraso: record.atraso, permisos: record.permisos, vacaciones: record.vacaciones, falta: record.falta, total: record.total, h25: record.h25, h50: record.h50, h100: record.h100}
      if(this.settings.time_group?.column?.userid == false) delete item.codigo
      if(this.settings.time_group?.column?.days == false) delete item.dias
      if(this.settings.time_group?.column?.subtotal == false) delete item.subtotal
      if(this.settings.time_group?.column?.permission == false) delete item.permisos
      if(this.settings.time_group?.column?.vacation == false) delete item.vacaciones
      if(this.settings.time_group?.column?.delay == false) delete item.atraso
      if(this.settings.time_group?.column?.hfalta == false) delete item.falta
      records.push(item)
    }
    var item_settings:ItemConfigInterface[] = [{property: 'dias', label: 'Días'}]
    report.addTable(records, 12, '#333', { top: 10 }, { border: { bottom: 1 }, borderColor: '#B4B4B4' }, 8, item_settings)
    report.print() 
  }

  sumarTiempos(arrayTiempos: any[]) {
    let totalMinutos = arrayTiempos.reduce((total, tiempo) => {
      if (arrayTiempos.length <= 2) total = 0
      let [horas, minutos] = tiempo.split(':').map(Number);
      return total + (horas * 60) + minutos;
    }, 0);

    let horas = Math.floor(totalMinutos / 60);
    let minutos = totalMinutos % 60;
    let resultado = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    return resultado;
  }

  getFirstDayOfMonth() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDayOfMonth;
  }

  changedate(value: string, input: string) {
    clearInterval(this.timmerLoad)
    var date = this.parseDate(value);
    if (date == null) return
    if (input == 'start') this.start.setValue(date)
    if (input == 'end') this.end.setValue(date)
    this.timmerLoad = setInterval(() => {
      clearInterval(this.timmerLoad)
      this.load_data()
    }, 250)
  }

  change_view_graph() {

  }

  formatearFecha(input: string | Date) {
    let fecha;
    if (typeof input === 'string') fecha = new Date(input);
    else if (input instanceof Date) fecha = input;
    else return 'Formato no válido'
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Sumar 1 porque los meses en JavaScript van de 0 a 11
    const año = fecha.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    return fechaFormateada;
  }

  parseDate(dateString: string) {
    const parts = dateString.split('/');
    if (parts.length != 3) return null
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    var date = new Date(year, month, day);
    if (isNaN(date.getTime())) return null
    return date
  }
}
