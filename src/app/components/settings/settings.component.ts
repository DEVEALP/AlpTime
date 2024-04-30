import { Component } from '@angular/core';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../newGlobaldata';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {

  settings_report:any = {}
  orientations = ['Vertical', 'Horizontal']
  title = 'Configuración'
  tab = 0
  loading = false;
  loading_report = false;
  dark_mode = false;
  btnReturn = false;
  apps:any[] = []

  constructor(private http: newHttpRequest, private home:HomeService) { } 

  ngOnInit(): void {
    newGlobalData.run()
    this.apps = newGlobalData.apps
    this.dark_mode = newGlobalData.theme
  }
  
  changeTheme(e:any){
    this.dark_mode = e.checked
    localStorage.setItem('theme', this.dark_mode.toString())
    newGlobalData.theme = this.dark_mode
    newGlobalData.loadTheme()
  }

  view_Settings(path:string):boolean{
    var app_exist = this.apps.find(app => app.route_path == path)
    if(app_exist) return true
    return false
  }

  async selectTab(tab: number, title:string){
    if(tab == 1){
      this.loading_report = true
      var id = this.apps.find(app => app.route_path == 'reports')?.id
      var settings = await this.getSettings(id)
      try{
        this.settings_report = JSON.parse(settings)
      }catch(e){
        this.home.toast.fire({icon: 'error', title: 'Error al cargar la configuración'})
      }
      this.loading_report = false
    }else if(tab == 2){

    }
    this.tab = tab
    this.title = title
    this.btnReturn = true
  }

  extend = false

  getSettings = (id:number) => new Promise<string>((resolve) => {
    this.http.get('settings/get?id='+id).then((res:any) => {
      var settings = '{}'
      if(res.length > 0) if(res[0].settings) settings = res[0].settings
      resolve(settings)
    }).catch((err:any) => {
      resolve('')
    })
  })

  changeOrientation(e:any, tab:number){
    if(tab >= 2 && tab <= 5){
      if(tab == 2) this.settings_report.attendance = {orientation: e}
      else if(tab == 3) this.settings_report.delay = {orientation: e}
      else if(tab == 4) this.settings_report.time_group = {orientation: e}
      else if(tab == 5) this.settings_report.time = {orientation: e}
      var id = this.apps.find(app => app.route_path == 'reports')?.id
      this.save(id)
    }
  }

  save(id:number){
    this.loading = true
    var json = JSON.stringify(this.settings_report)
    var body = {id: id, settings: json}
    this.http.post('settings/set', body).then((res:any) => {
      var index = this.apps.findIndex(app => app.id == id)
      if(index != -1){
        this.apps[index].settings = json
        localStorage.setItem('apps', JSON.stringify(this.apps))
      }
      this.loading = false
    }).catch((err:any) => {
      this.loading = false
    })
  }

  setSetings(){

  }

  changeColumn(e:any, tab:number, column:string,){
    if(tab == 2){
      if(!this.settings_report?.attendance) this.settings_report.attendance = {}
      if(!this.settings_report.attendance?.column) this.settings_report.attendance.column = {}
      if(e == undefined){
        if(this.settings_report?.attendance.column[column] == null) e = {checked: false}
        else e = {checked: !this.settings_report.attendance.column[column]}
      }
      this.settings_report.attendance.column[column] = e.checked
    }else if(tab == 3){
      if(!this.settings_report?.delay) this.settings_report.delay = {}
      if(!this.settings_report.delay?.column) this.settings_report.delay.column = {}
      if(e == undefined){
        if(this.settings_report?.delay.column[column] == null) e = {checked: false}
        else e = {checked: !this.settings_report.delay.column[column]}
      }
      this.settings_report.delay.column[column] = e.checked
    }else if(tab == 4){
      if(!this.settings_report?.time_group) this.settings_report.time_group = {}
      if(!this.settings_report.time_group?.column) this.settings_report.time_group.column = {}
      if(e == undefined){
        if(this.settings_report?.time_group.column[column] == null) e = {checked: false}
        else e = {checked: !this.settings_report.time_group.column[column]}
      }
      this.settings_report.time_group.column[column] = e.checked
    }else if(tab == 5){
      if(!this.settings_report?.time) this.settings_report.time = {}
      if(!this.settings_report.time?.column) this.settings_report.time.column = {}
      if(e == undefined){
        if(this.settings_report?.time.column[column] == null) e = {checked: false}
        else e = {checked: !this.settings_report.time.column[column]}
      }
      this.settings_report.time.column[column] = e.checked
    }
    var id = this.apps.find(app => app.route_path == 'reports')?.id
    this.save(id)
  }

  return_event(event:any){
    if(this.tab == 1) {
      this.btnReturn = false
      this.tab = 0
    }else if(this.tab >= 2 && this.tab <= 5){
      this.tab = 1
      this.extend = false
    }
  }
}
