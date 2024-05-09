import { Component, HostListener, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import am5themes_Animated from "@amcharts/amcharts5/themes/animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import { GeneratorReportPdfV2, ItemConfigInterface, viewTotalConfigInterface } from 'src/app/services/ReportV2';
import * as ExcelJS from 'exceljs';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../newGlobaldata';
import { TurnsService } from 'src/app/services/turns.service';

@Component({ 
  selector: 'app-time-report',
  templateUrl: './time-report.component.html',
  styleUrls: ['./time-report.component.css'],
  providers: [
  ]
})
export class TimeReportComponent {

  loading = false
  loadFilter = false
  loadUsers = true
  view_graph = false
  mobile = window.innerWidth < 700

  filtercount = 0
  user_index = -1

  start = new FormControl(this.getFirstDayOfMonth())
  end = new FormControl(new Date())
  date = new FormControl('')

  old_user_search = ''
  user_search = ''
  chart: am5percent.PieChart | undefined
  chart_label: am5.Label | undefined
  chart_legend: am5.Legend | undefined
  timer: any
  total_hours = ''
  total_atrasos = ''
  total_permisos = ''
  total_vacaciones = ''
  total_faltas = ''
  total_25 = ''
  total_50 = ''
  total_100 = ''
  urlReturn = ''
  search_type = 'Mensual'

  dataUser:any = {}
  users_data: any[] = []
  records: any[] = []
  records_graph: any[] = []

  timmerLoad: any
  user: any
  settings: any = {}

  @ViewChild('usersMenuTrigger') view_clients: MatMenuTrigger | undefined

  constructor(private home: HomeService, private http:newHttpRequest, private turnsvc:TurnsService) { }

  sumarTiempos(arrayTiempos: any[]) {
    let totalMinutos = arrayTiempos.reduce((total, tiempo) => {
      let [horas, minutos] = tiempo.split(':').map(Number);
      return total + (horas * 60) + minutos;
    }, 0);

    let horas = Math.floor(totalMinutos / 60);
    let minutos = totalMinutos % 60;

    let resultado = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    return resultado;
  }

  ngOnInit() {
    newGlobalData.run()
    this.dataUser = newGlobalData.dataUser
    var app:any = newGlobalData.apps.find((x: any) => x.route_path == 'reports')
    if (app) try{ this.settings = JSON.parse(app.settings) }catch(e){}
    if(this.turnsvc.view_user_report){
      this.user = {id: 0, userid: this.turnsvc.view_user_report.userid, name: this.turnsvc.view_user_report.name, imagen: ''}
      this.turnsvc.view_user_report = undefined
      this.user_search = this.formatearCapitalizarTexto(this.user.name)
      this.urlReturn = 'reports/time_group_report'
    }else{
      this.urlReturn = 'reports'
    }
    this.search_type = this.settings?.time?.search_type ?? 'Mensual'
    if(this.search_type == 'Mensual') this.setMonthAndYear(new Date(new Date().getFullYear(), new Date().getMonth(), 1), { close: () => { } })
  }

  getFirstDayOfMonth() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDayOfMonth;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(this.users_data.length){
      if (event.key === 'Escape') {
        this.view_clients?.closeMenu()
      }else if (event.key === 'ArrowDown') {
        this.user_index++;
        if (this.user_index >= this.users_data.length) this.user_index = 0
        document.getElementById('user_' + this.user_index)?.focus()
      }
    }
  }

  ngAfterViewInit() {
    if(!this.turnsvc.view_user_report) document.getElementById('search')?.focus()
  }

  setMonthAndYear(date_seleted: Date, datepicker: any) {
    datepicker.close();
    var date = date_seleted.toISOString()
    var parts = date.split('T')[0].split('-')
    this.date.setValue(parts[1] + '/' + parts[0])
    this.start.setValue(date_seleted)
    this.end.setValue(new Date(date_seleted.getFullYear(), date_seleted.getMonth() + 1, 0))
    this.load()
  }

  restDate(): Date {
    var fechaActual = new Date();
    var fechaHace7Dias = new Date(fechaActual);
    fechaHace7Dias.setDate(fechaActual.getDate() - 7);
    return fechaHace7Dias
  }

  focus(event?:any) {
    if(event) event.target.select()
    this.load_users('a')
  }

  changedate(value: string, input: string) {
    clearInterval(this.timmerLoad)
    var date = this.parseDate(value);
    if (date == null) return
    if (input == 'start') this.start.setValue(date)
    if (input == 'end') this.end.setValue(date)
    this.timmerLoad = setInterval(() => {
      clearInterval(this.timmerLoad)
      this.load()
    }, 250)
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

  formatearFecha(input: string | Date) {
    let fecha;
    if (typeof input === 'string'){
      if(input.includes('T')) fecha = new Date(input);
      else fecha = new Date(input + 'T05:00:00');
    }else if (input instanceof Date) fecha = input;
    else return 'Formato no válido'
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); 
    const año = fecha.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    return fechaFormateada;
  }

  writing() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.user_search != this.old_user_search) { this.old_user_search = this.user_search ?? ''; this.load_users() }
      clearInterval(this.timer);
    }, 600)
  }

  selected_user(user: any) {
    this.user = user
    this.user_search = this.formatearCapitalizarTexto(user.name)
    this.view_clients?.closeMenu()
    this.load();
  }

  formatearCapitalizarTexto(inputString: string) {
    var words = inputString?.trim()?.toLowerCase()?.split(' ')
    var texto = ''
    for (let word of words) texto += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
    return texto
  }

  load() {
    if(!this.start.value || !this.end.value){
      this.home.toast.fire({ icon: 'error', title: 'Seleccione un rango de fechas' })
      return
    }
    if (!this.loading && this.user && this.start.value && this.end.value) {
      this.loading = true
      var start_date = this.start.value.toISOString().split('T')[0]
      var end_date = this.end.value.toISOString().split('T')[0]
      var body = { 
        start_date: start_date, 
        end_date: end_date, 
        userid: this.user.userid, 
        turnid: 0,
        group: '',
        cargo: '',
        departamento: '',
        oficina: ''
      }
      this.user_index = -1
      this.http.post('report/general', body).then((e:any) => {
        this.loading = false
        for (let x of e) x.day_min = x.name_day.substring(0, 3)
          this.records = e
          this.getDataGraph()
      }).catch(() => {
        this.loading = false
      })
    }
  }

  getDataGraph() {
    this.records_graph = []
    for (let x of this.records) {
      var date_now = new Date().toISOString().split('T')[0]
      var total =  Number(x.total.replace(':', '.'))
      if(date_now != x.fecha || total > 0 ){
        var name = x.day_min + ', ' + x.fecha
        var data = { name: name, value: 0, total: total, value_text: x.total, color: '#51BFF2' }
        this.records_graph.push(data) 
      }
    }
    var day_vacaciones = this.records.filter(x => x.vacaciones != '00:00')
    for (let x of day_vacaciones) {
      var name = 'Vacaciones: ' + x.day_min + ', ' + x.fecha
      var data = { name: name, value: 0, total: Number(x.vacaciones.replace(':', '.')), value_text: x.vacaciones, color: '#1890D8' }
      this.records_graph.push(data)
    }

    var day_permisos = this.records.filter(x => x.permiso != '00:00')
    for (let x of day_permisos) {
      var name = 'Permiso: ' + x.day_min + ', ' + x.fecha
      var data = { name: name, value: 0, total: Number(x.permiso.replace(':', '.')), value_text: x.permiso, color: '#DEDE04' }
      this.records_graph.push(data)
    }    

    var sum_total = this.records.map(x => x.total)
    var all_total = sum_total.concat(day_vacaciones.map(x => x.vacaciones)).concat(day_permisos.map(x => x.permiso))
    this.total_hours = this.sumarTiempos(all_total)

    this.records_graph.push({ name: 'Atrasos', value: Number(this.total_atrasos.replace(':', '.')), value_text: this.total_atrasos, total: 0, color: '#F30000' })
    this.total_atrasos = this.sumarTiempos(this.records.map(x => x.atraso))

    this.total_permisos = this.sumarTiempos(this.records.map(x => x.permiso))
    this.records_graph.push({ name: 'Horas permiso', value: Number(this.total_permisos.replace(':', '.')), value_text: this.total_permisos, total: 0, color: '#DEDE04' })
    
    this.total_vacaciones = this.sumarTiempos(this.records.map(x => x.vacaciones))
    this.records_graph.push({ name: 'Horas vacaciones', value: Number(this.total_vacaciones.replace(':', '.')), value_text: this.total_vacaciones, total: 0, color: '#1890D8' })

    this.total_faltas = this.sumarTiempos(this.records.map(x => x.falta && x.vacaciones == '00:00' ))
    this.records_graph.push({ name: 'Horas falta', value: Number(this.total_faltas.replace(':', '.')), value_text: this.total_faltas, total: 0, color: '#F0A92D' })

    this.total_25 = this.sumarTiempos(this.records.map(x => x.h25))
    this.records_graph.push({ name: 'Horas 25%', value: Number(this.total_25.replace(':', '.')), value_text: this.total_25, total: 0, color: '#71EF9B' })

    this.total_50 = this.sumarTiempos(this.records.map(x => x.h50))
    this.records_graph.push({ name: 'Horas 50%', value: Number(this.total_50.replace(':', '.')), value_text: this.total_50, total: 0, color: '#3AD06C' })

    this.total_100 = this.sumarTiempos(this.records.map(x => x.h100))
    this.records_graph.push({ name: 'Horas 100%', value: Number(this.total_100.replace(':', '.')), value_text: this.total_100, total: 0, color: '#09B442' })

    this.changeDataGrahp()
  }

  createGraph() {
    let root = am5.Root.new("chartdiv");

    root.setThemes([am5themes_Animated.new(root)]);

    this.chart = root.container.children.push(am5percent.PieChart.new(root, { startAngle: 160, endAngle: 380 }));

    let series0 = this.chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: "total",
        categoryField: "name",
        startAngle: 160,
        endAngle: 380,
        radius: am5.percent(70),
        innerRadius: am5.percent(65),
        fillField: "color",
        tooltip: am5.Tooltip.new(root, { labelText: "{name}: {value_text} Horas" })
      })
    );

    series0.ticks.template.set("forceHidden", true);
    series0.labels.template.set("forceHidden", true);
    series0.data.setAll(this.records_graph);

    let series1 = this.chart.series.push(
      am5percent.PieSeries.new(root, {
        name: 'totals',
        startAngle: 160,
        endAngle: 380,
        valueField: "value",
        innerRadius: am5.percent(80),
        categoryField: "name",
        fillField: "color",
        tooltip: am5.Tooltip.new(root, { labelText: "{name}: {value_text} Horas" })
      })
    );

    series1.ticks.template.set("forceHidden", true);
    series1.labels.template.set("forceHidden", true);
    series1.data.setAll(this.records_graph); 
    
    var title = root.tooltipContainer.children.push(am5.Label.new(root, {
      x: am5.p50,
      y: am5.p50,
      centerX: am5.p50,
      centerY: am5.p50,
      fill: am5.color('#424242'),
      textAlign: "center",
      fontSize: 16
    }));

    title.set("text", `\n\n\n\nTotal horas trabajadas:`);

    this.chart_label = root.tooltipContainer.children.push(am5.Label.new(root, {
      x: am5.p50,
      y: am5.p50,
      centerX: am5.p50,
      centerY: am5.p50,
      fill: am5.color(0x000000),
      textAlign: "center",
      fontSize: 50,
      fontWeight: "bold"
    }));

    this.chart_label.set("text", `\n\n\n${this.total_hours} H`);

    this.chart_legend = this.chart.children.push(am5.Legend.new(root, { y: am5.percent(95), centerX: am5.percent(-50) }));
    
    var sub_dataItems = series1.dataItems.filter((x) => (x.get("value") ?? 0) > 0)
    this.chart_legend.data.setAll(sub_dataItems);
    series0.appear(1000);
    series1.appear(1000);
  }

  changeDataGrahp() {
    if (this.chart && this.chart_label) {
      this.chart.series.values.forEach((x) => {
        x.data.clear()
        x.data.setAll(this.records_graph)
        x.appear();
        if(x._settings.name=='totals' && this.chart_legend){
          var sub_dataItems = x.dataItems.filter((x) => (x.get("value") ?? 0) > 0)
          this.chart_legend.data.setAll(sub_dataItems);
        }
      })
      this.chart_label.set("text", `\n\n\n${this.total_hours} H`);
    } else {
      if (this.view_graph) this.createGraph()
    }
  }

  load_users(internal_value?: string) {
    if (this.user_search.length > 0 || internal_value) {
      this.loadUsers = true
      var search = this.user_search
      if (internal_value) search = internal_value
      this.http.post('device/users/get', { type:'min', top:5, search: search, deviceid:0 }).then((data:any) => {
        this.users_data = data
        if (data.length > 0) this.view_clients?.openMenu()
        else this.view_clients?.closeMenu()
        this.loadUsers = false
      }).catch(() => {        
        this.loadUsers = false
      })
    }
  }

  setFilter() {

  }

  change_view_graph() {
    if (this.view_graph) {
      this.chart?.dispose();
      this.chart = undefined;
    } else {
      setTimeout(() => { this.createGraph() }, 250);
    }
    this.view_graph = !this.view_graph
  }

  donwload_pdf() {
    if (this.records.length == 0) {
      this.home.toast.fire({ icon: 'error', title: 'No hay datos para descargar' })
      return
    }
    var orientation:any = 'horizontal'
    var heigth = 8
    var size = 0
    orientation = this.settings?.time_group?.orientation ?? 'horizontal'
    size = this.settings?.time?.font_size ?? 10
    heigth = 0.5 * size
    var report = new GeneratorReportPdfV2('Horas trabajadas por empleado', true, orientation, 10)
    report.addFooterText(this.dataUser.name_business, (size + 2), undefined, true, 'center', 'center', 4);
    report.addFooterText('Horas trabajadas por empleado', (size + 1), undefined, true, 'center', 'center', 4);
    report.addFooterText(`<strong>Fecha desde:</strong><tab2>${this.start.value?.toISOString().split('T')[0]}<tab2><strong>Hasta:</strong><tab2>${this.end.value?.toISOString().split('T')[0]}`, (size + 1), undefined, false, 'center', 'center', 4);
    report.addFooterText(`<strong>Empleado:</strong><tab>${this.user?.name}`, (size + 1), undefined, false, 'center', 'center', 4);
    console.log(JSON.parse(JSON.stringify(this.records)))
    if(this.settings?.time?.order == 'Fecha ascendente') this.records = this.records.sort((a, b) => new Date(a.fecha.trim() + 'T05:00:00').getTime() - new Date(b.fecha.trim() + 'T05:00:00').getTime())
    console.log(this.records)
    var report_table = []
    for (let x of this.records){
      var item = { fecha: this.formatearFecha(x.fecha), dia: x.day_min, entrada: x.ent1, sal1: x.sal1, ent2: x.ent2, salida: x.sal2, subtotal: x.subtotal, total: x.total, atrasos: x.atraso, h_falta: x.falta, h25: x.h25, h50: x.h50, h100: x.h100, observation: x.observacion}
      if(this.settings?.time?.column?.day == false) delete item.dia
      if(this.settings?.time?.column?.subtotal == false) delete item.subtotal
      if(this.settings?.time?.column?.observation == false) delete item.observation
      report_table.push(item)            
    }
    var items: ItemConfigInterface[] = [{property: 'observation', label:'Observación', wordStyles: [ {word: 'Insconsistencia', style: {color: '#C87300'}}, {word: 'Falto este dia', style: {color: '#C80000'}} ], conditionStyle: [ {value: 'Vacaciones periodo', condition: 'include', style: {color: '#01BD5A'} } ]}, { property: 'sal1', label: 'S. Almuerzo'}, { property: 'ent2', label: 'E. Almuerzo'}, { property: 'h25', label: 'H25%'}, { property: 'h50', label: 'H50%'}, { property: 'h100', label: 'H100%'}, {property: 'observation', label: 'Observación'}]
    var total: viewTotalConfigInterface = {title: 'TOTALES', border: { top: 1 }, borderColor: '#B4B4B4', propertys: [ {proeprty: 'total', type:'value', value: this.total_hours}, {proeprty: 'atrasos', type:'value', value: this.total_atrasos}, {proeprty: 'h_falta', type:'value', value: this.total_faltas}, {proeprty: 'h25', type:'value', value: this.total_25}, {proeprty: 'h50', type:'value', value: this.total_50}, {proeprty: 'h100', type:'value', value: this.total_100} ] }
    report.addTable(report_table, size, '#333', { top: 10 }, { border: { bottom: 1 }, borderColor: '#B4B4B4' }, heigth, items, 0, undefined, total)
    report.print() 
  }

  donwload_excel() {
    if (this.records.length == 0) {
      this.home.toast.fire({ icon: 'error', title: 'No hay datos para descargar' })
      return
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Horas trabajadas por empleado');
    worksheet.mergeCells('A1:L1');
    worksheet.mergeCells('A2:L2');
    worksheet.mergeCells('A3:L3');
    worksheet.mergeCells('A4:L4');
    worksheet.mergeCells('A5:L5');
    worksheet.getCell('A1').value = this.dataUser.name_business;
    worksheet.getCell('A2').value = 'Horas trabajadas por empleado';

    var start = '      ' + this.start.value?.toISOString().split('T')[0] + '      '
    var end = '      ' + this.end.value?.toISOString().split('T')[0]
    worksheet.getCell('A3').value = {'richText' : [ 
        {'font': {bold: true},'text': 'Fecha desde:'}, 
        {'font': {bold: false},'text':  start} ,
        {'font': {bold: true},'text': 'Hasta:'},
        {'font': {bold: false},'text': end} 
      ]}
    worksheet.getCell('A4').value = {'richText' : [ 
      {'font': {bold: true},'text': 'Empleado:      '}, 
      {'font': {bold: false},'text':  this.user?.name} ,
    ]}

    worksheet.getCell('A1').font = { bold: true }
    worksheet.getCell('A2').font = { bold: true }

    worksheet.getCell('A6').value = 'Fecha'
    worksheet.getCell('B6').value = 'Dia'
    worksheet.getCell('C6').value = 'Entrada'
    worksheet.getCell('D6').value = 'S. Almuerzo'
    worksheet.getCell('E6').value = 'E. Almuerzo'
    worksheet.getCell('F6').value = 'Salida'
    worksheet.getCell('G6').value = 'Total'
    worksheet.getCell('H6').value = 'Atrasos'
    worksheet.getCell('I6').value = 'H falta'
    worksheet.getCell('J6').value = 'H25%'
    worksheet.getCell('K6').value = 'H50%'
    worksheet.getCell('L6').value = 'H100%'
    worksheet.getCell('A6').font = { bold: true }
    worksheet.getCell('B6').font = { bold: true }
    worksheet.getCell('C6').font = { bold: true }
    worksheet.getCell('D6').font = { bold: true }
    worksheet.getCell('E6').font = { bold: true }
    worksheet.getCell('F6').font = { bold: true }
    worksheet.getCell('G6').font = { bold: true }
    worksheet.getCell('H6').font = { bold: true }
    worksheet.getCell('I6').font = { bold: true }
    worksheet.getCell('J6').font = { bold: true }
    worksheet.getCell('K6').font = { bold: true }
    worksheet.getCell('L6').font = { bold: true }
    worksheet.getCell('A6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('B6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('C6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('D6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('E6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('F6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('G6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('H6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('I6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('J6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('K6').border = { bottom: { style: 'thin' } }
    worksheet.getCell('L6').border = { bottom: { style: 'thin' } }

    var number = 7
    for (let x of this.records) {
      worksheet.getCell('A' + number).value = this.formatearFecha(x.fecha)
      worksheet.getCell('B' + number).value = x.dia
      worksheet.getCell('C' + number).value = x.ent1
      worksheet.getCell('D' + number).value = x.sal1
      worksheet.getCell('E' + number).value = x.ent2
      worksheet.getCell('F' + number).value = x.sal2
      worksheet.getCell('G' + number).value = x.total
      worksheet.getCell('H' + number).value = x.atraso
      worksheet.getCell('I' + number).value = x.falta
      worksheet.getCell('J' + number).value = x.h25
      worksheet.getCell('K' + number).value = x.h50
      worksheet.getCell('L' + number).value = x.h100
      number++;
    }
    worksheet.getCell('A' + number).font = { bold: true }
    worksheet.getCell('A' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('B' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('C' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('D' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('E' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('F' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('G' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('H' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('I' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('J' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('K' + number).border = { top: { style: 'thin' } }
    worksheet.getCell('L' + number).border = { top: { style: 'thin' } }
    worksheet.mergeCells('A' + number + ':F' + number);
    worksheet.getCell('A' + number).value = 'TOTALES'
    worksheet.getCell('G' + number).value = this.total_hours
    worksheet.getCell('H' + number).value = this.total_atrasos
    worksheet.getCell('I' + number).value = this.total_faltas
    worksheet.getCell('J' + number).value = this.total_25
    worksheet.getCell('K' + number).value = this.total_50
    worksheet.getCell('L' + number).value = this.total_100


    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Listado de Horas Atrasadas.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

}
