import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import am5themes_Animated from "@amcharts/amcharts5/themes/animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { GeneratorReportPdfV2, ItemConfigInterface, addTableInterface, viewTotalConfigInterface } from 'src/app/services/ReportV2';
import { HomeService } from 'src/app/services/home.service';
import { GeneratorReportExcel, totalTableInterface } from 'src/app/services/ReportExcel';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../newGlobaldata';
import { FilterAssingTurnComponent } from '../filter-assing-turn/filter-assing-turn.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-delay-report',
  templateUrl: './delay-report.component.html',
  styleUrls: ['./delay-report.component.css']
})
export class DelayReportComponent {

  loading = false
  loadFilter = false
  loadUsers = false
  view_graph = false
  mobile = window.innerWidth < 725

  filtercount = 0

  start = new FormControl(new Date()) //
  end = new FormControl(new Date())

  now = new Date().toISOString().split('T')[0]
  start_date = this.start.value?.toISOString().split('T')[0] ?? ''
  end_date = this.end.value?.toISOString().split('T')[0] ?? ''

  chart_type = 'time'
  old_user_search = ''
  chart: am5xy.XYChart | undefined
  timer: any

  records: any[] = []
  records_graph: any[] = []
  dataUser: any = {}
  area: any = []
  job: any = []
  office: any = []
  turns: any = []
  groups: any = []

  filters_actived = 0
  total_rango_a = 0
  total_rango_b = 0
  total_rango_c = 0
  width = 100 / 8
  total_atraso = ''

  timmerLoad: any
  root: am5.Root | undefined
  filters: any = { area: null, job: null, office: null, turn: null, group: null, user: null }
  filters_laoding = true
  settings: any = {}

  @ViewChild('usersMenuTrigger') view_clients: MatMenuTrigger | undefined

  constructor(private home: HomeService, private http: newHttpRequest, private dialog:MatDialog) { }

  ngOnInit() {
    newGlobalData.run()
    this.dataUser = newGlobalData.dataUser
    var app:any = newGlobalData.apps.find((x: any) => x.route_path == 'reports')
    if (app) try{ this.settings = JSON.parse(app.settings) }catch(e){}
    this.load()
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


  changedate(value: string, input: string, panel: any) {
    // if (input == 'end' && value.length == 0) this.start.setValue(this.end.value)
    clearInterval(this.timmerLoad)
    var date = this.parseDate(value);
    if (date == null) return
    if (input == 'start') this.start.setValue(date)
    if (input == 'end') this.end.setValue(date)
    this.timmerLoad = setInterval(() => {
      clearInterval(this.timmerLoad)
      panel.close()
      this.load()
    }, 250)
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

  formatearCapitalizarTexto(inputString: string) {
    var words = inputString?.trim()?.toLowerCase()?.split(' ')
    var texto = ''
    for (let word of words) texto += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
    return texto
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

  restaTiempos(tiempoA: string, tiempoB: string): string {
    const [horasA, minutosA] = tiempoA.split(':').map(Number);
    const minutosTotalA = horasA * 60 + minutosA;
    const [horasB, minutosB] = tiempoB.split(':').map(Number);
    const minutosTotalB = horasB * 60 + minutosB;
    let diferenciaMinutos = minutosTotalA - minutosTotalB;
    if (diferenciaMinutos < 0) diferenciaMinutos += 24 * 60;
    const horasResultado = Math.floor(diferenciaMinutos / 60);
    const minutosResultado = diferenciaMinutos % 60;
    const resultado = `${String(horasResultado).padStart(2, '0')}:${String(minutosResultado).padStart(2, '0')}`;
    return resultado;
  }

  calcularColorRGB(valor: number, rango: number) {
    const rojoBajo = [255, 120, 120];
    const rojoOscuro = [139, 0, 0];
    const proporcion = valor / rango;
    const r = Math.round(rojoBajo[0] + (rojoOscuro[0] - rojoBajo[0]) * proporcion);
    const g = Math.round(rojoBajo[1] + (rojoOscuro[1] - rojoBajo[1]) * proporcion);
    const b = Math.round(rojoBajo[2] + (rojoOscuro[2] - rojoBajo[2]) * proporcion);
    return `rgb(${r}, ${g}, ${b})`;
  }

  timeToMinutes(time: string): number {
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    return hours * 60 + minutes;
  }

  objetoConValorMaximo(array: any[], propiedad: string) {
    if (array.length === 0) return null;
    return array.reduce((objetoMaximo, objetoActual) => {
      return (objetoActual[propiedad] > objetoMaximo[propiedad]) ? objetoActual : objetoMaximo;
    });
  }


  load() {
    if (!this.loading) {
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
          this.records = []
          this.total_rango_a = 0
          this.total_rango_b = 0
          this.total_rango_c = 0
          this.total_atraso = ''
          for (let x of e) {
            var min_atraso = this.timeToMinutes(x.atraso)
            if(min_atraso > 0){
              if(min_atraso > 0 && min_atraso <= 10){
                this.total_rango_a++
                x.rango_a = x.ent1
              }else if(min_atraso > 10 && min_atraso <= 20){
                this.total_rango_b++
                x.rango_b = x.ent1
              }else{
                this.total_rango_c++
                x.rango_c = x.ent1
              }
              this.records.push(x)
            }
          }
          if (this.filters?.user) this.total_atraso = this.sumarTiempos(this.records.map(x => x.atraso))
            console.log(this.total_atraso)
          this.setDataGraph();
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }else{
        this.home.toast.fire({ icon: 'error', title: 'Seleccione un rango de fechas válido' })
      }
    }
  }

  setTypeChar(type: string) {
    this.chart_type = type
    this.chart?.dispose();
    this.chart = undefined;
  }

  getMinName(name: string) {
    var name = name
    var parts_name = name.split(' ')
    if (parts_name.length > 2) name = parts_name[0] + ' ' + parts_name[2]
    return name
  }

  setDataGraph() {
    this.records_graph = []
    if (this.start_date == this.end_date || this.filters?.user) {
      if (this.chart_type == 'bar') this.setTypeChar('time')
    } else {
      if (this.chart_type == 'time') this.setTypeChar('bar')
    }
    var records = this.records.filter(x => x.atraso != '00:00')
    if (records.length == 0 && this.view_graph) {
      this.home.toast.fire({ icon: 'error', title: 'No hay datos para mostrar' })
      return
    }
    var max_value = 0
    if (this.chart_type == 'time') {
      for (let x of records) {
        var time = this.timeToMinutes(x.atraso)
        var time_from = this.restaTiempos(x.ent1, x.atraso)
        var time_to = this.sumarTiempos([x.atraso, x.ent1])
        var data: any = { fromDate: `${this.now} ${time_from}`, toDate: `${this.now} ${time_to}`, value: time }
        if (this.filters?.user) data.name = x.fecha
        else data.name = this.getMinName(this.formatearCapitalizarTexto(x.nombres))
        if (time > max_value) max_value = time
        this.records_graph.push(data)
      }
    } else {
      var users = records.reduce((result, objeto) => { if (!result.find((x: string) => x == objeto.userid)) result.push(objeto.userid); return result; }, []);
      for (let user of users) {
        var user_records = records.filter(u => u.userid == user)
        var time_hours = this.sumarTiempos(user_records.map((e: any) => e.atraso))
        var value = this.timeToMinutes(time_hours)
        if (value > max_value) max_value = value
        this.records_graph.push({ userid: user, name: this.getMinName(user_records[0].nombres), value: value, time: time_hours })
      }
    }
    for (let x of this.records_graph) x.columnSettings = { fill: am5.color(this.calcularColorRGB(x.value, max_value)) }
    this.changeDataGrahp()
  }

  changeDataGrahp() {
    if (this.chart) {
      this.chart.series.values.forEach((x) => {
        x.data.clear()
        x.data.setAll(this.records_graph)
        this.chart?.yAxes.values.forEach((x) => {
          x.data.clear()
          x.data.setAll(this.records_graph)
        })
        x.appear();
      })
    } else {
      if (this.view_graph) this.createGrafico()
    }
  }

  change_view_graph() {
    if (this.view_graph) {
      this.chart?.dispose();
      this.chart = undefined;
    } else {
      setTimeout(() => { this.createGrafico() }, 250);
    }
    this.view_graph = !this.view_graph
  }

  createGrafico() {
    if (!this.root) {
      this.root = am5.Root.new("chartdiv");
      this.root.setThemes([am5themes_Animated.new(this.root)]);
    }

    var char_setting: am5xy.IXYChartSettings = { panX: false, panY: false, wheelX: "none", wheelY: "none", paddingLeft: 0 }
    var series: any

    if (this.chart_type == 'time') {
      char_setting.layout = this.root.verticalLayout
      // this.root.dateFormatter.setAll({ dateFormat: "yyyy-MM-dd HH:mm", dateFields: ["valueX", "openValueX"] });
      this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, char_setting));
      let yAxis = this.chart.yAxes.push(
        am5xy.CategoryAxis.new(this.root, {
          categoryField: "name",
          renderer: am5xy.AxisRendererY.new(this.root, {
            inversed: true,
            minorGridEnabled: true
          }),
          tooltip: am5.Tooltip.new(this.root, {
            themeTags: ["axis"],
            animationDuration: 200
          })
        })
      );
      yAxis.data.setAll(this.records_graph);
      let xAxis = this.chart.xAxes.push(
        am5xy.DateAxis.new(this.root, {
          baseInterval: { timeUnit: "minute", count: 1 },
          renderer: am5xy.AxisRendererX.new(this.root, {
            minorGridEnabled: true,
            minGridDistance: 90
          })
        })
      );
      series = this.chart.series.push(am5xy.ColumnSeries.new(this.root, {
        xAxis: xAxis,
        yAxis: yAxis,
        openValueXField: "fromDate",
        valueXField: "toDate",
        categoryYField: "name",
        sequencedInterpolation: true
      }));
      series.columns.template.setAll({
        templateField: "columnSettings",
        strokeOpacity: 0,
        tooltipText: "[bold]{name}: [\]{openValueX.formatDate(\"H:mm a\")} - {valueX.formatDate(\"H:mm a\")}"
      });
      series.data.processor = am5.DataProcessor.new(this.root, { dateFields: ["fromDate", "toDate"], dateFormat: "yyyy-MM-dd HH:mm" });
    } else {
      // this.root.numberFormatter.setAll({ numberFormat: "#.#s" });
      this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, char_setting));
      let xRenderer = am5xy.AxisRendererX.new(this.root, {
        minGridDistance: 30,
        minorGridEnabled: true
      });

      let xAxis = this.chart.xAxes.push(am5xy.CategoryAxis.new(this.root, {
        maxDeviation: 0,
        categoryField: "name",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(this.root, {})
      }));

      xRenderer.grid.template.set("visible", false);

      let yRenderer = am5xy.AxisRendererY.new(this.root, {});
      let yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
        maxDeviation: 0,
        min: 0,
        extraMax: 0.1,
        renderer: yRenderer
      }));

      yRenderer.grid.template.setAll({ strokeDasharray: [2, 2] });

      series = this.chart.series.push(am5xy.ColumnSeries.new(this.root, {
        name: "Series 1",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        sequencedInterpolation: true,
        categoryXField: "name",
        tooltip: am5.Tooltip.new(this.root, { dy: -25, labelText: "{time} Horas" })
      }));

      series.columns.template.setAll({
        templateField: "columnSettings",
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0
      });

      let cursor = this.chart.set("cursor", am5xy.XYCursor.new(this.root, {}));
      cursor.lineY.set("visible", false);

      xAxis.data.setAll(this.records_graph);
    }

    series.data.setAll(this.records_graph);
    series?.appear();
    this.chart.appear(1000, 100);
  }

  donwload_pdf() {
    if (this.records.length == 0) {
      this.home.toast.fire({ icon: 'error', title: 'No hay datos para descargar' })
      return
    }
    var orientation:any = 'vertical'
    var size = 10
    orientation = this.settings.delay?.orientation ?? 'vertical'
    size = this.settings.delay?.font_size ?? 10
    var report = new GeneratorReportPdfV2('Listado de Horas Atrasadas', true, orientation, 10)
    report.addFooterText(this.dataUser.name_business, (size + 2), undefined, true, 'center', 'center', 2);
    report.addFooterText('Listado de Horas Atrasadas', (size + 1), undefined, true, 'center', 'center', 2);
    report.addFooterText(`<strong>Fecha desde:</strong><tab2>${this.start.value?.toISOString().split('T')[0]}<tab2><strong>Hasta:</strong><tab2>${this.end.value?.toISOString().split('T')[0]}`, (size + 1), undefined, false, 'center', 'center', 2);
    if (this.filters?.user) report.addFooterText(`<strong>Empleado:</strong><tab>${this.records[0].nombres}`, (size + 1), undefined, false, 'center', 'center', 2);
    var report_table = []
    for (let x of this.records) {
      var item: any = { fecha: this.formatearFecha(x.fecha) }
      if (!this.filters?.user) item.nombres = x.nombres
      item.dia = x.name_day?.substring(0, 3)
      item.rango_a = x.rango_a
      item.rango_b = x.rango_b
      item.rango_c = x.rango_c
      item.atraso = x.atraso
      if(this.settings.delay?.column?.day == false) delete item.dia
      report_table.push(item)
    }
    var items: ItemConfigInterface[] = [{ property: 'rango_a', label: '0 m - 10 m' }, { property: 'rango_b', label: '11 m - 20 m' }, { property: 'rango_c', label: '20 m - Mas' }]
    var total: viewTotalConfigInterface = { propertys: [{ proeprty: 'rango_a', type: 'count' }, { proeprty: 'rango_b', type: 'count' }, { proeprty: 'rango_c', type: 'count' }], title: 'TOTALES', border: { top: 1 }, borderColor: '#B4B4B4' }
    if (this.filters?.user) total.propertys?.push({ proeprty: 'atraso', type: 'value', value: this.total_atraso })
    var table:addTableInterface = {data: report_table, fontSize: size, color: '#333', margin:{ top: 10 }, settingsHead: { border: { bottom: 1 }, borderColor: '#B4B4B4' }, cellHeight: 8, settingsItems: items, viewTotal: total}
    report.addTable(table)
    report.print()
  }

  donwload_excel() {
    if (this.records.length == 0) {
      this.home.toast.fire({ icon: 'error', title: 'No hay datos para descargar' })
      return
    }
    var excel = new GeneratorReportExcel()
    excel.addPage('Listado de Horas Atrasadas')
    if (!this.filters?.user) excel.addColumnWidth('B', 30)
    excel.addColumnWidth(['A', 'C', 'D', 'E', 'F'], 15)
    excel.combinateColumns(['A1:I1', 'A2:I2', 'A3:I3'])
    excel.addText(this.dataUser.name_business, 'A1', { bold: true })
    excel.addText('Listado de Horas Atrasadas', 'A2', { bold: true })
    var text = `Fecha desde:        ${this.start.value?.toISOString().split('T')[0]}             Hasta:        ${this.end.value?.toISOString().split('T')[0]}`
    excel.addText(text, 'A3', undefined, [{ word: 'Fecha desde:', style: { bold: true } }, { word: 'Hasta:', style: { bold: true } }])
    if (this.filters?.user) excel.addText(`Empleado:       ${this.records[0].nombres}`, 'A4', undefined, [{ word: 'Empleado:', style: { bold: true } }])
    var report_table = []
    for (let x of this.records) {
      var item: any = { fecha: this.formatearFecha(x.fecha) }
      if (!this.filters?.user) item.nombres = x.nombres
      item.dia = x.name_day?.substring(0, 3)
      item.rango_a = x.rango_a
      item.rango_b = x.rango_b
      item.rango_c = x.rango_c
      item.atraso = x.atraso
      report_table.push(item)
    }
    var property_settings = [{ property: 'rango_a', label: '0 m - 10 m' }, { property: 'rango_b', label: '11 m - 20 m' }, { property: 'rango_c', label: '20 m - Mas' }]
    var head = { border: { color: '#999999', width: 1, position: { bottom: 1 } }, background: 'transparent', font: { bold: true, fontSize: 12 } }
    var total: totalTableInterface = { title: 'TOTALES', propertys: [{ type: 'count', property: 'rango_a' }, { type: 'count', property: 'rango_b' }, { type: 'count', property: 'rango_c' }] }
    if (this.filters?.user) total.propertys?.push({ property: 'atraso', type: 'value', value: this.total_atraso })
    excel.addTable(report_table, undefined, undefined, undefined, property_settings, head, total)
    excel.download('Listado de Horas Atrasadas')
  }

}
