import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HomeService } from 'src/app/services/home.service';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { RecordComponent } from '../record/record.component';
import { ActivatedRoute, Router } from '@angular/router';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { FilterAssingTurnComponent } from '../../filter-assing-turn/filter-assing-turn.component';
import { newGlobalData } from '../../newGlobaldata';

@Component({
  selector: 'app-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.css']
})
export class RegistersComponent {

  dataUser: any = {}
  loading = true
  order = ''
  property = ''
  view = { entrance: true, exit: true, repeated: true, lunch_entrance: true, lunch_outing: true, Descocindo: true }
  old_search = ''
  timer: any = null
  text = new FormControl<string>('')
  start = new FormControl<Date | null>(null)
  end = new FormControl<Date | null>(null)
  records_data: any = []
  records: any[] = []
  mobile = innerWidth < 880
  device: any = { id: 0, name: '' }
  calendar: any = []
  groups: any = []
  area: any = []
  job: any = []
  office: any = []
  turns: any = []
  types: any = [
    { state: true, nombre: 'Entrada' },
    { state: true, nombre: 'Salida' },
    { state: true, nombre: 'Otros' }
  ]
  filtercount = 0
  filter: any = {
    type: this.types,
    group: '',
    calendar: {}
  }
  filters: any = { area: null, job: null, office: null, turn: null, group: null, user: null, calendar: null }
  group = { codigo: '', nombre: 'Todos' }

  constructor(private router_actived: ActivatedRoute, private router: Router, private homesvc: HomeService, private dialog: MatDialog, private http: newHttpRequest) { }

  @ViewChild('startI') startI: ElementRef | undefined;
  @ViewChild('endI') endI: ElementRef | undefined;


  ngOnInit() {
    var params: any = this.router_actived.snapshot.params;
    if (params?.id == undefined || params.id == '') {
      this.router.navigate(['../devices'])
    } else {
      this.device = params
    }
    this.dataUser = newGlobalData.dataUser
    this.load();
    this.getDataFilter();
  }

  async getDataFilter() {
    await this.getTurns()
    await this.getCalendar()
    await this.getTurns()
    await this.getGroups()
    await this.getOptions()
    this.loadFilter = false
  }

  setFilter() {
    var open_dialog = this.dialog.open(FilterAssingTurnComponent, { data: { filters: this.filters, filter_users: true, area: this.area, calendar: this.calendar, job: this.job, office: this.office, groups: this.groups, turns: this.turns }, 'width': '320px', disableClose: true, panelClass: 'asignUser' })
    open_dialog.afterClosed().subscribe((result: any) => {
      if (result) {
        this.filters = result
        if (this.filters.calendar) this.start.setValue(new Date(this.filters.calendar.value1)), this.end.setValue(new Date(this.filters.calendar.value2))
        this.load()
      }
    })
  }

  getCalendar = () => new Promise<void>((resolve, reject) => {
    this.http.get('device/calendar/get').then((e: any) => {
      if (e && e.length > 0) this.calendar = e
      resolve()
    }).catch(() => {
      reject()
    })
  })

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

  countFilters() {
    this.filtercount = 0
    if (this.filter.group) this.filtercount++;
    if (this.filter.calendar?.value1) this.filtercount++;
  }

  loadFilter = true

  upload() {
    if (this.loading) {
      this.homesvc.toast.fire({ icon: 'warning', title: 'Hay un proceso en curso' })
      return
    }
    if (this.start.value != null && this.end.value != null) {
      Swal.fire({
        title: "Sincronizar registros",
        text: "Sincronizar registros puede tomar un tiempo dependiendo el rango de fechas seleccionadas y la cantidad de dispositivos registrados",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, subir!"
      }).then((result) => {
        if (result.isConfirmed) {
          this.loading = true
          var start_date = this.start.value?.toISOString().split('T')[0] ?? ''
          var end_date = this.end.value?.toISOString().split('T')[0] ?? ''
          this.http.post('device/records/async', { start_date: start_date, end_date: end_date, device_id: this.device.id }).then((res: any) => {
            this.loading = false
            Swal.fire({
              title: 'Usuarios: ' + res?.totalUsers + '/' + res?.uploadUsers + ', Registros: ' + res?.totalRecords + '/' + res?.uploadRecords,
              showClass: {
                popup: `
                      animate__animated
                      animate__fadeInUp
                      animate__faster
                    `
              },
              hideClass: {
                popup: `
                      animate__animated
                      animate__fadeOutDown
                      animate__faster
                    `
              }
            });
          }).catch(() => {
            this.loading = false
          })
        }
      })
    } else {
      this.homesvc.toast.fire({ icon: 'error', title: 'Selecione un rango de fecha' })
    }
  }

  setGroup(group: any) {
    this.group = group;
    this.load()
  }

  download() {
    this.homesvc.loading.emit(true)
    this.donwload_file(this.records, 'Registro de marcaciones', 'xlsx')
  }

  donwload_file(x: any, name: string, ext: string): void {
    var fecha = new Date();
    var dd = fecha.getDate();
    var mm = fecha.getMonth() + 1;
    var yyyy = fecha.getFullYear();
    var h = fecha.getHours();
    var m = fecha.getMinutes();
    var date = dd + "-" + mm + "-" + yyyy + " " + h + "-" + m
    var nam = name + date
    var ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(x);
    var wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, nam + "." + ext);
    setTimeout(() => { this.homesvc.loading.emit(false) }, 50);
  }

  writing() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.text.value != this.old_search) { this.old_search = this.text.value ?? ''; this.load() }
      clearInterval(this.timer);
    }, 600)
  }
  load() {
    this.loading = true
    var start_date = this.start.value?.toISOString().split('T')[0] ?? ''
    var end_date = this.end.value?.toISOString().split('T')[0] ?? ''
    var body = {
      device_id: Number(this.device.id),
      start_date: start_date,
      end_date: end_date,
      turnid: this.filters.turn ?? 0,
      userid: this.filters.user ?? 0,
      office: this.filters.office ?? '',
      departament: this.filters.area ?? '',
      cargo: this.filters.job ?? '',
      group: this.filters.group ?? ''
    }
    this.http.post('device/records/get', body).then((e: any) => {
      this.loading = false
      this.records_data = e;
      this.records = e
    }).catch(() => {
      this.loading = false
    })
  }


  download_info2() {
    if (this.start.value != null && this.end.value != null) {
      if (this.loading) return
      this.loading = true
      var start_date = this.start.value?.toISOString().split('T')[0] ?? ''
      var end_date = this.end.value?.toISOString().split('T')[0] ?? ''
      this.http.post('device/report_old', { start_date: start_date, end_date: end_date }).then(async (e: any) => {
        this.loading = false
        if (e.length == 0) {
          this.homesvc.toast.fire({ icon: 'warning', title: 'No se encontraron registros' })
          return
        }
        var reporte: any = []
        for (let x of e) {
          var index = reporte.findIndex((r: any) => r.date == x.fecha?.trim())
          if (index == -1) {
            var fecha = { date: x.fecha?.trim(), records: [] }
            index = reporte.length
            reporte.push(fecha)
          }
          reporte[index].records.push(x)
        }
        await this.createDocument(reporte, e.length)
      }).catch(() => {
        this.loading = false
      })
    }
  }

  setRecord(data?: any) {
    if (this.dataUser.rol != 1 && this.dataUser.rol != 5 || this.loading) return
    const dialogRef = this.dialog.open(RecordComponent, { data: { record: data, deviceid: this.device.id }, panelClass: 'userTurns', width: '350px', maxWidth: '90vw' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (typeof (result) == 'string') {
          this.homesvc.loading.emit(true)
          var body = { id: data.id, action: 'delete', deviceid: this.device.id, userid: data.userid, datetime: '' }
          this.http.post('device/records/options', body).then((e: any) => {
            this.homesvc.loading.emit(false)
            if (e.length > 0 && e[0].code == 200) {
              var index = this.records.findIndex((e: any) => e.id == data.id)
              if (index > -1) {
                this.records.splice(index, 1)
                this.homesvc.toast.fire({ icon: 'success', title: 'Eliminado con exito' })
              }
            } else {
              this.homesvc.toast.fire({ icon: 'error', title: 'No se elimino el registro' })
            }
          }).catch(() => {
            this.homesvc.loading.emit(false)
          })
        } else {
          if (data) {
            result.id = data.id
            result.action = 'update'
            this.homesvc.loading.emit(true)
            this.http.post('device/records/options', result).then((e: any) => {
              this.homesvc.loading.emit(false)
              if (e.length > 0 && e[0].code == 200) {
                data.Registro = result.datetime
                data.Fecha = result.datetime.split(' ')[0]
                data.Hora = result.datetime.split(' ')[1]
                this.homesvc.toast.fire({ icon: 'success', title: 'Actualizado con exito' })
              } else {
                this.homesvc.toast.fire({ icon: 'error', title: 'No se actualizo el registro' })
              }
            }).catch(() => {
              this.homesvc.loading.emit(false)
            })
          } else {
            result.id = 0
            result.action = 'add'
            this.homesvc.loading.emit(true)
            this.http.post('device/records/options', result).then((e: any) => {
              this.homesvc.loading.emit(false)
              if (e.length > 0 && e[0].code == 200) {
                this.records.push(e[0])
                this.homesvc.toast.fire({ icon: 'success', title: 'Agregado con exito' })
              } else {
                this.homesvc.toast.fire({ icon: 'error', title: 'No se actualizo el registro' })
              }
            }).catch(() => {
              this.homesvc.loading.emit(false)
            })
          }
        }
      }
    })
  }

  async createDocument(days: any[], total: number) {
    var heigth_document = 0
    var table_create = false
    var body = ''
    var cabecera = `<div class="textcenter title1">${this.dataUser.name_business}</div><div class="textcenter title2">- Reporte de Asistencias y Atrasos Completo -</div><div class="textcenter title3"><b>Fecha desde:</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${this.start.value?.toISOString().split('T')[0]}<b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Hasta: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </b>${this.end.value?.toISOString().split('T')[0]}</div>`

    for (let day of days) {
      if (table_create) {
        body += `<tr><td colspan="10"><div class="tabledate"><b>Fecha:</b>&nbsp;${day.date.split('T')[0]}</div></td></tr>`
        heigth_document = heigth_document + 26
      } else {
        body += cabecera
        heigth_document = 155
        body += `<table class="mtable"><tr><td class="tabletitle">Codigo</td><td class="tabletitle">Nombre</td><td class="tabletitle">Grupo</td><td class="tabletitle">Horario</td><td class="tabletitle">Entra</td><td class="tabletitle">Sale</td><td class="tabletitle">Entra</td><td class="tabletitle">Sale</td><td class="tabletitle">Atrasos</td></tr><tr><td colspan="10"><div class="border"></div></td></tr>`
        table_create = true
        body += `<tr><td colspan="10"><div class="tabledate"><b>Fecha:</b>&nbsp;${day.date.split('T')[0]}</div></td></tr>`
      }
      for (let record of day.records) {
        if (heigth_document == 0 && !table_create) {
          heigth_document = 125
          body += cabecera
          table_create = true
          body += `<table class="mtable"><tr><td class="tabletitle">Codigo</td><td class="tabletitle">Nombre</td><td class="tabletitle">Grupo</td><td class="tabletitle">Horario</td><td class="tabletitle">Entra</td><td class="tabletitle">Sale</td><td class="tabletitle">Entra</td><td class="tabletitle">Sale</td><td class="tabletitle">Atrasos</td></tr><tr><td colspan="10"><div class="border"></div></td></tr>`
        }

        body += `<tr class="trclass"><td class="tabletext">${record.codigo}</td><td class="tabletext">${record.nombres}</td><td class="tabletext">${record.grupo}</td><td class="tabletext">${record.turno}</td><td class="tabletext">${record.e1}</td><td class="tabletext">${record.s1}</td><td class="tabletext">${record.e2}</td><td class="tabletext">${record.s2}</td><td class="tabletext">${record.Atraso}</td></tr>`
        heigth_document = heigth_document + 15

        if ((heigth_document + 15) >= 940) {
          table_create = false
          heigth_document = 0
          body += '</table>'
        }
      }
    }

    body += `</table><div style="width: 100%;height: 30px;display: flex;flex-direction: row;align-items: center;justify-content: space-between;"><div style="font-size: 11px;font-weight: 600;color: #333;margin: 0px 10px;">Total de registros</div><div style="font-size: 11px;font-weight: 600;color: #333;margin: 0px 10px;">${total}</div></div>`

    var title = '- Reporte de Asistencias y Atrasos Completo -'
    var head = '<style>body{padding:0px; margin: 0px} *{padding:0px;font-family:Arial,Helvetica,sans-serif;}.mtable{margin-top:15px; width: 100%}.cont{width:100%;display:flex;flex-direction:column;}.textcenter{width:100%;padding:5px 0px;display:flex;justify-content:center;align-items:center;}.title1{font-size:14px;font-weight:600;color:#000;height: 16px;max-height: 16px;}.title2{font-size:12px;font-weight:600;color:#222;height: 13px;max-height: 23px;}.title3{font-size:12px;font-weight:500;color:#444;height: 13px;max-height: 13px;}.border{border-top:1px solid #233;width:100%;}.tabledate{width:100%;height:26px;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;font-size:13px;color:#333;}.tabletitle{font-size:12px;font-weight:600;color:#444;}.tabletext{font-size:11px;font-weight:500;color:#444;}.trclass{height:15px;min-height:15px;}</style>'
    var script = true ? '<script> setTimeout(() => { window.print(); if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) { setTimeout(() => { window.close(); }, 8000); }else{ window.close(); } }, 100); </script>' : ''
    var settings = "width=900,height=650,titlebar=yes,toolbar=no,menubar=no,location=yes,scrollbars=yes,status=yes";
    var w: any = await this.newWindows('', '_black', settings);
    w.document.write(`<html><head><title>${title}</title>${head}</head><body>${body}${script}</body></html>`);
  }

  download_info2_excel() {
    if (this.start.value != null && this.end.value != null) {
      if (this.loading) return
      this.loading = true
      var start_date = this.start.value?.toISOString().split('T')[0] ?? ''
      var end_date = this.end.value?.toISOString().split('T')[0] ?? ''
      this.http.post('device/report_old', { start_date: start_date, end_date: end_date }).then(async (e: any) => {
        var reporte: any = []
        for (let x of e) {
          var index = reporte.findIndex((r: any) => r.date == x.fecha?.trim())
          if (index == -1) {
            var fecha = { date: x.fecha?.trim(), records: [] }
            index = reporte.length
            reporte.push(fecha)
          }
          reporte[index].records.push(x)
        }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte');
        worksheet.getColumn('A').width = 20;
        worksheet.getColumn('B').width = 40;
        worksheet.mergeCells('A1:J1');
        worksheet.mergeCells('A2:J2');
        worksheet.mergeCells('A3:J3');
        worksheet.mergeCells('A4:J4');
        worksheet.mergeCells('A5:J5');
        worksheet.getCell('A1').value = this.dataUser.name_business;
        worksheet.getCell('A2').value = '- Reporte de Asistencias y Atrasos Completo -';
        worksheet.getCell('A3').value = 'Fecha desde:       ' + this.start.value?.toISOString().split('T')[0] + '       hasta:       ' + this.end.value?.toISOString().split('T')[0];
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' }
        worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' }

        worksheet.getCell('A1').font = { bold: true, size: 12 }

        worksheet.getCell('A6').value = 'Codigo'
        worksheet.getCell('B6').value = 'Nombre'
        worksheet.getCell('C6').value = 'Grupo'
        worksheet.getCell('D6').value = 'Horario'
        worksheet.getCell('E6').value = 'Entra'
        worksheet.getCell('F6').value = 'Sale'
        worksheet.getCell('G6').value = 'Entra'
        worksheet.getCell('H6').value = 'Sale'
        worksheet.getCell('I6').value = 'Atrasos'
        worksheet.getCell('A6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('B6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('C6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('D6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('E6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('F6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('G6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('H6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('I6').border = { bottom: { style: 'medium' } }
        worksheet.getCell('A6').font = { bold: true }
        worksheet.getCell('B6').font = { bold: true }
        worksheet.getCell('C6').font = { bold: true }
        worksheet.getCell('D6').font = { bold: true }
        worksheet.getCell('E6').font = { bold: true }
        worksheet.getCell('F6').font = { bold: true }
        worksheet.getCell('G6').font = { bold: true }
        worksheet.getCell('H6').font = { bold: true }
        worksheet.getCell('I6').font = { bold: true }

        var linea = 7
        for (let x of reporte) {
          worksheet.mergeCells('A' + linea + ':J' + linea);
          worksheet.getCell('A' + linea).value = 'Fecha: ' + x.date.split('T')[0]
          linea++;
          for (let y of x.records) {
            worksheet.getCell('A' + linea).value = y.codigo
            worksheet.getCell('B' + linea).value = y.nombres
            worksheet.getCell('C' + linea).value = y.grupo
            worksheet.getCell('D' + linea).value = y.turno
            worksheet.getCell('E' + linea).value = y.e1
            worksheet.getCell('F' + linea).value = y.s1
            worksheet.getCell('G' + linea).value = y.e2
            worksheet.getCell('H' + linea).value = y.s2
            worksheet.getCell('I' + linea).value = y.Atraso
            linea++;
          }
        }


        workbook.xlsx.writeBuffer().then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Reporte de Asistencias y Atrasos Completo.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
        });
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    } else {
      this.homesvc.toast.fire({ icon: 'error', title: 'Selecione un rango de fecha' })
    }
  }

  async newWindows(url: string, title: string, settings: string): Promise<Window | null | undefined> {
    var w: Window | null = window.open(url, title, settings);
    if (w == null || typeof (w) == 'undefined') {
      this.homesvc.toast.fire({ icon: 'error', title: 'Habilite las ventanas emergente' }) //await this.alert({title:'Habilite las ventanas emergente', text:'Para poder generar el documento es requerido el permiso a las ventanas emergente', icon:'success', image:'../../../assets/png/enable_popup.png'}).then(async ()=>{ return await this.newWindows(url, title, settings) }).catch(()=>{return null});  
      return
    } else {
      return w
    }
  }

  download_info() {
    if (this.start.value != null && this.end.value != null) {
      this.homesvc.loading.emit(true)
      var start_date = this.start.value?.toISOString().split('T')[0] ?? ''
      var end_date = this.end.value?.toISOString().split('T')[0] ?? ''
      this.http.post('device/report_old2', { start_date: start_date, end_date: end_date, device_id: this.device.id }).then((e: any) => {
        this.homesvc.loading.emit(false)
        this.donwload_file(e, 'Reporte marcaciones', 'xlsx')
      }).catch(() => {
        this.homesvc.loading.emit(false)
      })
    } else {
      this.homesvc.toast.fire({ icon: 'error', title: 'Selecione un rango de fecha' })
    }
  }

  changeOrder(property: string) {
    if (this.property == property) {
      if (this.order == 'asc') { this.order = 'desc' } else { this.order = 'asc' }
    } else {
      this.property = property;
      this.order = 'asc'
    }
    this.load();
  }

  timmerLoad: any

  changedate(value: string, input: string) {
    clearInterval(this.timmerLoad)
    var date = this.parseDate(value);
    if (date == null) return
    if (input == 'start') this.start.setValue(date)
    if (input == 'end') this.end.setValue(date)
    if (this.end.value == null || this.start.value == null) return
    this.timmerLoad = setInterval(() => {
      clearInterval(this.timmerLoad)
      this.filter.calendar = {}
      this.countFilters()
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


  changeView() {
    this.records = this.records_data.filter((r: any) => this.filter.type.find((type: any) => type.state && type.nombre == r.Tipo))
  }
  changeorder() {
    if (this.order == 'asc') {
      this.order = 'desc'
    } else {
      this.order = 'asc'
    }
  }
}
