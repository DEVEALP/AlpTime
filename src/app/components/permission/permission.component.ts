import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { PermissionAddComponent } from '../permission-add/permission-add.component';
import { FilterAssingTurnComponent } from '../filter-assing-turn/filter-assing-turn.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent {

  date_show = ''
  start = new FormControl<Date | null>(null)
  end = new FormControl<Date | null>(null)
  filters: any = { area: null, job: null, office: null, turn: null, group: null, user: null, period: null }
  groups: any = []
  area: any = []
  job: any = []
  office: any = []
  turns: any = []
  periods: any = []
  vacations: any[] = []
  loading = false
  loadFilter = true
  filtercount = 0

  constructor(private home:HomeService, private http:newHttpRequest, private dialog:MatDialog) { }

  ngOnInit(){
    var year = new Date().getFullYear()
    this.periods = [year, year - 1, year - 2, year - 3]
    this.getDataFilter()
    var date = new Date()
    date.setDate(1)
    this.setMonthAndYear(date, null)
  }

  setMonthAndYear(normalizedMonthAndYear: any, datepicker: any) {
    var end_date = new Date(normalizedMonthAndYear.getTime())
    this.start.setValue(normalizedMonthAndYear)
    end_date.setMonth(normalizedMonthAndYear.getMonth() + 1)
    end_date.setDate(0)
    this.end.setValue(end_date)
    this.date_show = normalizedMonthAndYear.getMonth() + 1 + '/' + normalizedMonthAndYear.getFullYear()
    datepicker?.close();
    this.load()
  }

  valid_date(){
    var parts = this.date_show?.split('/')
    if(parts?.length != 2){
      this.date_show = (this.start.value?.getMonth() ?? 0) + 1 + '/' + this.start.value?.getFullYear()
      this.home.toast.fire({icon: 'error', title: 'Formato de fecha incorrecto'})
      return
    }
    var month = parseInt(parts[0])
    var year = parseInt(parts[1])
    if(isNaN(month) || isNaN(year)){
      this.date_show = (this.start.value?.getMonth() ?? 0) + 1 + '/' + this.start.value?.getFullYear()
      this.home.toast.fire({icon: 'error', title: 'Formato de fecha incorrecto'})
      return
    }
    if(month < 1 || month > 12){
      this.date_show = (this.start.value?.getMonth() ?? 0) + 1 + '/' + this.start.value?.getFullYear()
      this.home.toast.fire({icon: 'error', title: 'Mes incorrecto'})
      return
    }
    if(year < (new Date().getFullYear() - 2) || year > (new Date().getFullYear() + 2)){
      this.date_show = (this.start.value?.getMonth() ?? 0) + 1 + '/' + this.start.value?.getFullYear()
      this.home.toast.fire({icon: 'error', title: 'Año incorrecto'})
      return
    }
    var date_start = new Date(year, month - 1, 1)
    var date_end = new Date(year, month, 0)
    if(isNaN(date_start.getTime())){
      this.date_show = (this.start.value?.getMonth() ?? 0) + 1 + '/' + this.start.value?.getFullYear()
      this.home.toast.fire({icon: 'error', title: 'Formato de fecha incorrecto'})
      return
    }
    this.start.setValue(date_start)
    this.end.setValue(date_end)
    this.load()
  }

  async getDataFilter() {
    await this.getGroups()
    await this.getOptions()
    this.loadFilter = false
  }
  
  getGroups = () => new Promise<void>((resolve, reject) => {
    this.http.get('device/groups/get?value=').then((e: any) => {
      this.groups = e
      resolve()
    }).catch(() => {
      reject()
    })
  })

  setFilter(){
    var open_dialog = this.dialog.open(FilterAssingTurnComponent, { data: { filters: this.filters, filter_users: true, area: this.area, job: this.job, office: this.office, groups: this.groups, periods: this.periods }, 'width': '320px', disableClose: true, panelClass: 'asignUser' })
    open_dialog.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log(result)
        this.filters = result
        this.load()
      }
    })
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

  timmerLoad: any

  countFilters() {
    this.filtercount = 0
    if (this.filters.group) this.filtercount++;
    if (this.filters.calendar?.value1) this.filtercount++;
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


  load(){
    this.loading = true
    var start_date = this.start.value?.toISOString().split('T')[0] ?? ''
    var end_date = this.end.value?.toISOString().split('T')[0] ?? ''
    var body = {
      start: start_date,
      end: end_date,
      motive: this.filters.motive ?? 0,
      userid: this.filters.user ?? 0,
      office: this.filters.office ?? '',
      departament: this.filters.area ?? '',
      cargo: this.filters.job ?? '',
      group: this.filters.group ?? ''
    }
    this.http.post('permission/get', body).then((res:any)=>{
      this.loading = false
      this.vacations = res
    }).catch((err:any)=>{
      this.loading = false
    })
  }

  delete_v(permission:any){
    this.home.alert({icon: 'warning', title: '¿Está seguro de eliminar el permiso?', text: 'Esta acción no se puede deshacer'}).then((result:any)=>{
      this.loading = true
      this.http.post('permission/asing', {action: 'delete', motive:'', details:'', time:'', userid: permission.id_user, start: permission.desde, end: permission.hasta}).then((res:any)=>{
        this.load()
        this.home.toast.fire({icon: 'success', title: 'Permiso eliminado'})
      }).catch((err:any)=>{
        this.loading = false
      })
    }).catch((err:any)=>{
      
    })
  }

  add(){
    this.dialog.open(PermissionAddComponent, {data: {}, width: '340px', disableClose: true, panelClass: 'asignUser'})
    .afterClosed().subscribe((result:any)=>{
      if(result){
        this.load()
      }
    })
  }
}
