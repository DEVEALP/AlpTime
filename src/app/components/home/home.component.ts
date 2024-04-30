import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { AuditComponent } from '../audit/audit.component';
import { DeviceComponent } from '../device/device.component';
import { DevicesComponent } from '../devices/devices.component';
import { AddComponent } from '../turn/add/add.component';
import { TurnComponent } from '../turn/turn.component';
import { ReportComponent } from '../report/report.component';
import { ReportDetailComponent } from '../report-detail/report-detail.component';
import { AttendancePunctualityRecordComponent } from '../attendance-punctuality-record/attendance-punctuality-record.component';
import { newGlobalData } from '../newGlobaldata';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  dataUser:any = {}
  page = ''
  title = '' 
  version = '' 
  return:any = []
  loading = true
  menu_actived = false
  @ViewChild('container', { read: ViewContainerRef, static: true }) container: any;

  constructor(private homesvc:HomeService, private router:Router, private activedRouter:ActivatedRoute) { }
  ngOnInit(){
    this.dataUser = JSON.parse(localStorage.getItem('dataUser') ?? '{}')
    this.homesvc.loading.subscribe((state:boolean)=>{ setTimeout(()=> this.loading = state, 25) })
    this.homesvc.getreturn.subscribe(()=>{this.return_click() })
    this.homesvc.changepage.subscribe((value:string)=>{ this.setComponent({component: value}) })
    this.homesvc.setreturn.subscribe((data:any)=>{ 
      data.old_name = this.title;
      this.title = data.new_name;
      this.return.push(data)
    })
    var params:any = this.activedRouter.snapshot.params;
    this.page = params.component;
    // this.setComponent({component:'turns'});
    this.setComponent(params);
    this.version = newGlobalData.version;
  }


  setComponent(params:any){
    this.page = params.component;
    console.log(params)
    if(params.component  == 'audit'){
      this.title = 'Auditoria'
      var comp = this.createComponent(AuditComponent);
    }else if(params.component  == 'device'){
      if(params.id.length > 0 && params.name.length > 0){
        var component = this.createComponent(DeviceComponent);
        component.dataUser = this.dataUser;
        this.homesvc.setreturn.emit({new_name: params.name, action: ()=> this.router.navigate(['../'])})
      }else{
        this.router.navigate(['../'])
      }
    }else if(params.component  == 'turn'){
      if(params.id.length > 0 && params.name.length > 0){
        var component = this.createComponent(TurnComponent);
        this.homesvc.setreturn.emit({new_name: params.name, action: ()=> this.router.navigate(['../turns'])})
      }else{
        this.router.navigate(['../'])
      }
    }else if(params.component  == 'turns'){
      this.title = 'Turnos'
      this.createComponent(TurnComponent);
    }else if(params.component  == 'add_turn'){
      // this.title = 'Agregar turno'
      var comp = this.createComponent(AddComponent); 
    }else if(params.component  == 'report'){
      // this.title = 'Agregar turno'
      if(params?.id && params?.name && params?.value){
        this.title = params.name
        var comp = this.createComponent(ReportDetailComponent);
        comp.user = {id: params.id, name: params.name, date: params.value}
        this.homesvc.setreturn.emit({new_name: params.name, action: ()=> this.router.navigate(['../report'])})
      }else{
        this.title = 'Reporte'
        this.homesvc.loading.emit(false)
        var comp = this.createComponent(ReportComponent);
      }
    }else if(params.component  == 'attendance_delays'){
      this.title = 'Asistencias y Atrasos'
      this.homesvc.loading.emit(false)
      var comp = this.createComponent(AttendancePunctualityRecordComponent);
    }else{
      this.title = 'Biometricos'
      this.page = 'devices'
      this.createComponent(DevicesComponent);
    }
  }

  redirect(url:string){
    this.router.navigate([url]);
  }

  return_click(){
    var data = this.return[this.return.length - 1];
    data?.action();
    this.title = data.old_name;
    this.return.splice(this.return.length - 1,1)
  }

  createComponent(component: any) {
    if(this.container){
      this.container.clear();
      var componentRef = this.container.createComponent(component);          
      const componentInstance = componentRef.instance;
      return componentInstance;
    }
  }
}
