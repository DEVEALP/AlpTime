import { Component } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { GeneratorReportPdfV2, ItemConfigInterface, viewTotalConfigInterface } from 'src/app/services/ReportV2';
import am5themes_Animated from "@amcharts/amcharts5/themes/animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../newGlobaldata';
import { FilterAssingTurnComponent } from '../filter-assing-turn/filter-assing-turn.component';
import { AttendanceObservationComponent } from '../attendance-observation/attendance-observation.component';

@Component({
  selector: 'app-attendance-punctuality-record',
  templateUrl: './attendance-punctuality-record.component.html',
  styleUrls: ['./attendance-punctuality-record.component.css']
})
export class AttendancePunctualityRecordComponent { 

  filters_laoding = true
  view_graph = false
  types: any = [
    { state: true, nombre: 'Entrada' },
    { state: true, nombre: 'Salida' },
    { state: true, nombre: 'Otros' }
  ]
  loadFilter = true
  loading = false
  filtercount = 0
  filters_actived = 0
  filter: any = {
    type: this.types,
    group: '',
    user: '',
    device: {},
    calendar: {}
  }
  dataUser: any = {}
  mobile = window.innerWidth < 720
  text = new FormControl()
  start = new FormControl(new Date())
  end = new FormControl(new Date())
  records_back: any[] = []
  records: any[] = []
  records_for_user: any[] = []
  area: any = []
  job: any = []
  office: any = []
  turns: any = []
  groups: any = []
  devices: any = []
  users: string[] = []
  filters: any = { area: null, job: null, office: null, turn: null, group: null, user: null }
  chart: am5xy.XYChart | undefined
  settings: any = {}

  constructor(private homesvc: HomeService, private router: Router, private dialog: MatDialog, private http:newHttpRequest) { }

  ngOnInit() {
    newGlobalData.run()
    this.dataUser = newGlobalData.dataUser
    var app:any = newGlobalData.apps.find((x: any) => x.route_path == 'reports')
    if (app) try{ this.settings = JSON.parse(app.settings) }catch(e){}
    this.getFilters();
    this.load();
    console.log(this.settings.attendance)
  }

  createGrafico() {
    let root = am5.Root.new("chartdiv");
    const myTheme = am5.Theme.new(root);
    root.setThemes([am5themes_Animated.new(root),myTheme]);

    this.chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      maxTooltipDistance: 0,
      pinchZoomX: true
    }));


    let xAxis = this.chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      groupData: true,
      baseInterval: {
        timeUnit: 'day',
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    for(let x of this.records_for_user){
      let series = this.chart.series.push(am5xy.LineSeries.new(root, {
        name: x.name,
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: x.name +": {valueY} horas"
        })
      }));
      series.data.setAll(x.data);
      series.appear();
    }

    let cursor = this.chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);

    this.chart.set("scrollbarX", am5.Scrollbar.new(root, {orientation: "horizontal"}));

    this.chart.set("scrollbarY", am5.Scrollbar.new(root, {orientation: "vertical"}));

    let legend = this.chart.rightAxesContainer.children.push(am5.Legend.new(root, {
      width: 200,
      paddingLeft: 15,
      height: am5.percent(100)
    }));

    legend.itemContainers.template.events.on("pointerover", (e:any)=>{
      let itemContainer = e.target;

      let series = itemContainer.dataItem.dataContext;

      this.chart?.series.each((chartSeries:any)=>{
        if (chartSeries != series) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000)
          });
        } else {
          chartSeries.strokes.template.setAll({
            strokeWidth: 3
          });
        }
      })
    })

    legend.itemContainers.template.events.on("pointerout", (e:any)=>{
      let itemContainer = e.target;
      let series = itemContainer.dataItem.dataContext;

      this.chart?.series.each((chartSeries:any)=>{
        chartSeries.strokes.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: chartSeries.get("fill")
        });
      });
    })

    legend.itemContainers.template.set("width", am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right"
    });

    legend.data.setAll(this.chart.series.values);

    this.chart.appear(1000, 100);
  }


  change_view_graph(){
    if(this.view_graph){
      this.chart?.dispose();
      this.chart = undefined;
    }else{
      var start = this.start.value?.getTime() ?? 0
      var end = this.end.value?.getTime() ?? 0
      var days = (end - start) / 1000 / 60 / 60 / 24
      if(days < 2){
        this.homesvc.toast.fire({ icon: 'warning', title: 'Rango mínimo entre fechas debe ser 2 días' })
        return
      }
      if(this.records_for_user.length > 15){
        this.records_for_user = this.records_for_user.slice(0, 15)
        this.homesvc.toast.fire({ icon: 'warning', title: 'Se muestran solo los primeros 15 usuarios' })
      }
      setTimeout(() => {this.createGrafico()}, 250);
    }
    this.view_graph = !this.view_graph
  }

  getCordName(fullname: string): string {
    var name = fullname.split(' ')
    if (name.length > 2) {
      return name[0] + ' ' + name[2]
    } else {
      return name[0] + ' ' + name[1]
    }
  }

  setFilters() {
    if (this.filters_laoding) return
    var open_dialog = this.dialog.open(FilterAssingTurnComponent, { data: { filter_users: true, filters: this.filters, calendar:[], area: this.area, job: this.job, office: this.office, groups: this.groups, turns: this.turns }, 'width': '320px', disableClose: true, panelClass: 'asignUser' })
    open_dialog.afterClosed().subscribe((result: any) => {
      if (result) {
        this.filters_actived = 0
        for (let key in result) if (result[key] != null) { this.filters_actived++ }
        this.filters = result
        this.load()
      }
    })
  }

  setObservation(data:any) {
    if(this.settings?.attendance?.observation == "Personalizado" || this.settings?.attendance?.observation == "Ambos"){
      var dialog = this.dialog.open(AttendanceObservationComponent, { data: data.observation, width: '320px', panelClass: 'asignUser' })
      dialog.afterClosed().subscribe((result: any) => {
        if (result) {
          this.loading = true
          result = result.trim()
          this.http.post('report/observation', { userid: data.userid, date: data.fecha, observation: result }).then((e: any) => {
            this.loading = false
            this.homesvc.toast.fire({ icon: 'success', title: 'Observación guardada' })
            data.observation = result
            if(this.settings?.attendance?.observation?.trim() == "Personalizado") data.observation_view = data.observation
            else if(this.settings?.attendance?.observation?.trim() == "Ambos") data.observation_view = data.observation + (data.observacion.length > 0 && data.observation.length ? ', ' : '') + data.observacion
          }).catch(() => {
            this.loading = false
            this.homesvc.toast.fire({ icon: 'error', title: 'Error al guardar la observación' })
          })
        }
      })
    }
  }

  async donwload_pdf() {
    var orientation:any = 'horizontal'
    var size = 10
    var heigth = 8
    orientation = this.settings?.attendance?.orientation ?? 'horizontal'
    size = this.settings?.attendance?.font_size ?? 10
    heigth = 0.5 * size
    var report = new GeneratorReportPdfV2('Reporte de Asistencia y Puntualidad', true, orientation, 5)
    report.addFooterText(this.dataUser.name_business, (size + 2), undefined, true, 'center', 'center', 4);
    report.addFooterText('Reporte de Asistencia y Puntualidad', (size + 1), undefined, true, 'center', 'center', 6);
    report.addFooterText(`<strong>Fecha desde:</strong><tab2>${this.start.value?.toISOString().split('T')[0]}<tab2><strong>Hasta:</strong><tab2>${this.end.value?.toISOString().split('T')[0]}`, (size + 1), undefined, false, 'center', 'center', 6);
    report.addSpace(10);
    var my_records = []
    for (let x of this.records_back) {
      var item = {fecha: x.fecha, codigo: x.userid, nombres: x.nombres,  grupo: x.group_name, turno: x.turn_name, ent1: x.ent1, sal1: x.sal1, ent2: x.ent2, sal2: x.sal2, atraso: x.atraso, h_falta: x.falta, total: x.total, observation: x.observation_view}
      if(this.settings?.attendance?.column?.delay == false) delete item.atraso
      if(this.settings?.attendance?.column?.lack == false) delete item.h_falta
      if(this.settings?.attendance?.column?.total == false) delete item.total
      if(this.settings?.attendance?.column?.code == false) delete item.codigo
      if(this.settings?.attendance?.column?.group == false) delete item.grupo
      if(this.settings?.attendance?.column?.turn == false) delete item.turno
      if(this.settings?.attendance?.column?.observation == false) delete item.observation
      my_records.push(item)
    }
    var propertys: ItemConfigInterface[] = [{property: 'observation', label:'Observación', wordStyles: [ {word: 'Insconsistencia', style: {color: '#C87300'}}, {word: 'Falto este dia', style: {color: '#C80000'}} ], conditionStyle: [ {value: 'Vacaciones periodo', condition: 'include', style: {color: '#01BD5A'} } ]}, { property: 'grupo', format: 'string' }, { property: 'turno', label: 'Horario', align: 'center', format: 'string' }, { property: 'ent1', label: 'Entra', align: 'center' }, { property: 'ent2', label: 'Entra', align: 'center' }, { property: 'sal1', label: 'Sale', align: 'center' }, { property: 'sal2', label: 'Sale', align: 'center' }, { property: 'fecha', subHead: { addTitle: 'Fecha: ', showItem: false } }, {property: 'h_falta', label: 'H. falta'}]
    var total: viewTotalConfigInterface = { show_total_records: true, fontSize: 7, border: { top: 1 }, borderColor: '#C1C1C1' }
    report.addTable(my_records, size, '#333', undefined, { border: { bottom: 1 }, background: 'transparent' }, heigth, propertys, undefined, undefined, total)
    report.print();
  }

  donwload_excel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Asistencia y Puntualidad');
    worksheet.getColumn('A').width = 20;
    worksheet.getColumn('B').width = 40;
    worksheet.getColumn('C').width = 25;
    worksheet.getColumn('D').width = 25;
    worksheet.mergeCells('A1:J1');
    worksheet.mergeCells('A2:J2');
    worksheet.mergeCells('A3:J3');
    worksheet.mergeCells('A4:J4');
    worksheet.getCell('A1').value = this.dataUser.name_business;
    worksheet.getCell('A2').value = '- Reporte de Asistencias y Atrasos Completo -';
    worksheet.getCell('A3').value = 'Fecha desde:       ' + this.start.value?.toISOString().split('T')[0] + '       hasta:       ' + this.end.value?.toISOString().split('T')[0];
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.getCell('A1').font = { bold: true, size: 12 }
    worksheet.getCell('A5').value = 'Codigo'
    worksheet.getCell('B5').value = 'Nombre'
    worksheet.getCell('C5').value = 'Grupo'
    worksheet.getCell('D5').value = 'Horario'
    worksheet.getCell('E5').value = 'Entra'
    worksheet.getCell('F5').value = 'Sale'
    worksheet.getCell('G5').value = 'Entra'
    worksheet.getCell('H5').value = 'Sale'
    worksheet.getCell('I5').value = 'Atrasos'
    worksheet.getCell('J5').value = 'Horas falta'
    worksheet.getCell('K5').value = 'Total'
    worksheet.getCell('A5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('B5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('C5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('D5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('E5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('F5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('G5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('H5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('I5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('J5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('K5').border = { bottom: { style: 'thin' } }
    worksheet.getCell('A5').font = { bold: true }
    worksheet.getCell('B5').font = { bold: true }
    worksheet.getCell('C5').font = { bold: true }
    worksheet.getCell('D5').font = { bold: true }
    worksheet.getCell('E5').font = { bold: true }
    worksheet.getCell('F5').font = { bold: true }
    worksheet.getCell('G5').font = { bold: true }
    worksheet.getCell('H5').font = { bold: true }
    worksheet.getCell('I5').font = { bold: true }
    worksheet.getCell('J5').font = { bold: true }
    worksheet.getCell('K5').font = { bold: true }
    var linea = 6
    for (let x of this.records) {
      worksheet.mergeCells('A' + linea + ':J' + linea);
      worksheet.getCell('A' + linea).value = 'Fecha: ' + x.date.split('T')[0]
      linea++;
      for (let y of x.records) {
        worksheet.getCell('A' + linea).value = y.userid
        worksheet.getCell('B' + linea).value = y.nombres
        worksheet.getCell('C' + linea).value = y.group_name
        worksheet.getCell('D' + linea).value = y.turn_name
        worksheet.getCell('E' + linea).value = y.ent1
        worksheet.getCell('F' + linea).value = y.sal1
        worksheet.getCell('G' + linea).value = y.ent2
        worksheet.getCell('H' + linea).value = y.sal2
        worksheet.getCell('I' + linea).value = y.atraso
        worksheet.getCell('J' + linea).value = y.falta
        worksheet.getCell('K' + linea).value = y.total
        linea++;
      }
    }
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Reporte de Asistencias y Atrasos.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
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

  load() {
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
      this.http.post('report/general', body).then((e: any) => {
        this.loading = false
        this.records_back = e
        this.getDataFilter()
        this.changeDataGrahp()
      }).catch(() => {
        this.loading = false
      })
    } else {
      this.homesvc.toast.fire({ icon: 'error', title: 'Selecione un rango de fecha' })
    }
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

  changeDataGrahp(){
    if (this.chart) {
      this.chart.series.values.forEach((x) => {
        x.data.clear()
        var data = this.records_for_user.find((y: any) => y.name == x._settings.name)
        if (data) {
          x.data.setAll(data.data)
          x.appear();
        }
      })
    }else{
      if(this.view_graph) this.createGrafico()
    }
  }


  getDataFilter() {
    this.records = []
    this.records_for_user = []
    if (this.filter.user == '') this.users = []
    for (let x of this.records_back) {
      if(this.settings?.attendance?.observation?.trim() == "Personalizado") x.observation_view = x.observation
      else if(this.settings?.attendance?.observation?.trim() == "Por defecto" || !this.settings?.attendance?.observation) x.observation_view = x.observacion
      else if(this.settings?.attendance?.observation?.trim() == "Ambos") x.observation_view = x.observation + (x.observacion.length > 0 && x.observation.length ? ', ' : '') + x.observacion
      if (this.filter.user == '') {
        var exist = this.users.find(u => u == x.nombres)
        if (!exist) this.users.push(x.nombres)
      }
      if (
        (this.filter.group == '' || this.filter.group == x.group_code) &&
        (this.filter.user == '' || this.filter.user == x.nombres)) {
        var index = this.records.findIndex(y => y.date == x.fecha)
        if (index == -1) {
          index = this.records.length
          this.records.push({ date: x.fecha, records: [] })
        }
        this.records[index].records.push(x)
      }
      if(
          x.fecha != new Date().toISOString().split('T')[0] && 
          (this.filter.group == '' || this.filter.group == x.group_code) &&
          (this.filter.user == '' || this.filter.user == x.nombres)
          ){
        var index = this.records_for_user.findIndex((y: any) => y.userid == x.userid)
        if (index == -1) {
          index = this.records_for_user.length
          this.records_for_user.push({ name: this.getCordName(this.formatearCapitalizarTexto(x.nombres)), userid: x.userid, data: [] })
        }
        this.records_for_user[index].data.push({ date: new Date(x.fecha).getTime(), value: Number(x.total.replace(':', '.')) })
      }
    }
  }
  
  formatearCapitalizarTexto(inputString: string) {
    var words = inputString?.trim()?.toLowerCase()?.split(' ')
    var texto = ''
    for (let word of words) texto += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
    return texto
  }

  view_details(record: any) {
    return
    this.router.navigate(['reports', 'attendance_delays', record.userid?.trim(), record.nombres, record.fecha])
  }

  timmerLoad: any

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

}
