import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { AuthGuard } from './guards/auth.guard';
import { DevicesComponent } from './components/devices/devices.component';
import { DeviceComponent } from './components/device/device.component';
import { ReportComponent } from './components/report/report.component';
import { AttendancePunctualityRecordComponent } from './components/attendance-punctuality-record/attendance-punctuality-record.component';
import { ReportDetailComponent } from './components/report-detail/report-detail.component';
import { TurnComponent } from './components/turn/turn.component';
import { DelayReportComponent } from './components/delay-report/delay-report.component';
import { TimeReportComponent } from './components/time-report/time-report.component';
import { TimeGroupReportComponent } from './components/time-group-report/time-group-report.component';
import { VacationsComponent } from './components/vacations/vacations.component';
import { PermissionComponent } from './components/permission/permission.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EmployeComponent } from './components/employe/employe.component';
import { EmployesComponent } from './components/employes/employes.component';
import { CalendarUserComponent } from './components/calendar-user/calendar-user.component';
import { CalendarUserRecordsComponent } from './components/calendar-user-records/calendar-user-records.component';

const routes: Routes = [
  {path:'auth',  component:AuthComponent},
  
  {path:'reports/time_group_report', canActivate: [AuthGuard], component:TimeGroupReportComponent},
  {path:'reports/time_report', canActivate: [AuthGuard], component:TimeReportComponent},
  {path:'reports/delay_report', canActivate: [AuthGuard], component:DelayReportComponent},
  {path:'reports/attendance_delays/:code/:name/:date', canActivate: [AuthGuard], component:ReportDetailComponent},
  {path:'reports/attendance_delays', canActivate: [AuthGuard], component:AttendancePunctualityRecordComponent},
  {path:'reports', canActivate: [AuthGuard], component:ReportComponent},

  {path:'turns', canActivate: [AuthGuard], component:TurnComponent},

  {path:'calendar_user', canActivate: [AuthGuard], component:CalendarUserComponent},
  {path:'calendar_user/:date', canActivate: [AuthGuard], component:CalendarUserRecordsComponent},
  {path:'vacations', canActivate: [AuthGuard], component:VacationsComponent},
  {path:'permission', canActivate: [AuthGuard], component:PermissionComponent},

  {path:'employes', canActivate: [AuthGuard], component:EmployesComponent},
  {path:'employes/:id', canActivate: [AuthGuard], component:EmployeComponent},
  
  {path:'devices/:id/:name', canActivate: [AuthGuard], component:DeviceComponent},
  {path:'devices', canActivate: [AuthGuard], component:DevicesComponent},
  {path:'settings', canActivate: [AuthGuard], component:SettingsComponent},
  {path:'', canActivate: [AuthGuard], component:DevicesComponent},
  {path:'**',  redirectTo: '/auth'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
