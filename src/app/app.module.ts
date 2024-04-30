import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'; 

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './Material_modules';
import { HomeComponent } from './components/home/home.component';
import { DevicesComponent } from './components/devices/devices.component';
import { RegistersComponent } from './components/device/registers/registers.component';
import { InfoDComponent } from './components/device/info/info.component';
import { deviceSettingsComponent } from './components/device/settings/settings.component';
import { UsersComponent } from './components/device/users/users.component';
import { AuthComponent } from './components/auth/auth.component';
import { AlertComponent } from './components/alert/alert.component';
import { DeviceComponent } from './components/device/device.component';
import { EditDComponent } from './components/device/edit/edit.component';
import { TurnComponent } from './components/turn/turn.component';
import { AddComponent } from './components/turn/add/add.component';
import { InfoTComponent } from './components/turn/info/info.component';
import { EditTComponent } from './components/turn/edit/edit.component';
import { AuditComponent } from './components/audit/audit.component';
import { ItemsMenuComponent } from './components/turn/items-menu/items-menu.component';
import { SelectTurnComponent } from './components/turn/select-turn/select-turn.component';
import { DefaultMatCalendarRangeStrategy } from '@angular/material/datepicker';
import { UsersforturnComponent } from './components/usersforturn/usersforturn.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { SettingsPrintComponent } from './components/settings-print/settings-print.component';
import { RecordComponent } from './components/device/record/record.component';
import { ProcessComponent } from './components/device/process/process.component';
import { ReportComponent } from './components/report/report.component';
import { ReportDetailComponent } from './components/report-detail/report-detail.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AttendancePunctualityRecordComponent } from './components/attendance-punctuality-record/attendance-punctuality-record.component';
import { MenuComponent } from './components/menu/menu.component';
import { DelayReportComponent } from './components/delay-report/delay-report.component';
import { TimeReportComponent } from './components/time-report/time-report.component';
import { DevelopmentComponent } from './components/development/development.component';
import { AssignedTurnComponent } from './components/assigned-turn/assigned-turn.component';
import { TimeGroupReportComponent } from './components/time-group-report/time-group-report.component';
import { FilterAssingTurnComponent } from './components/filter-assing-turn/filter-assing-turn.component';
import { TurnsAssingViewComponent } from './components/turns-assing-view/turns-assing-view.component';
import { MoveTurnComponent } from './components/move-turn/move-turn.component';
import { VacationsComponent } from './components/vacations/vacations.component';
import { VacationsAddComponent } from './components/vacations-add/vacations-add.component';
import {MatSliderModule} from '@angular/material/slider';
import { PermissionComponent } from './components/permission/permission.component';
import { PermissionAddComponent } from './components/permission-add/permission-add.component';
import { SettingsComponent } from './components/settings/settings.component';
import { EmployesComponent } from './components/employes/employes.component';
import { EmployeComponent } from './components/employe/employe.component';
import { UnassignTurnComponent } from './components/unassign-turn/unassign-turn.component';

@NgModule({
  declarations: [ 
    AppComponent,
    HomeComponent,
    DevicesComponent,
    RegistersComponent,
    InfoDComponent,
    deviceSettingsComponent,
    UsersComponent,
    AuthComponent,
    AlertComponent,
    DeviceComponent,
    EditDComponent,
    TurnComponent,
    AddComponent,
    InfoTComponent,
    EditTComponent,
    AuditComponent,
    ItemsMenuComponent,
    SelectTurnComponent,
    MoveTurnComponent,
    UsersforturnComponent,
    UserEditComponent,
    SettingsPrintComponent,
    RecordComponent,
    ProcessComponent,
    ReportComponent,
    ReportDetailComponent,
    AttendancePunctualityRecordComponent,
    MenuComponent,
    DelayReportComponent,
    TimeReportComponent,
    DevelopmentComponent,
    AssignedTurnComponent,
    TimeGroupReportComponent,
    FilterAssingTurnComponent,
    TurnsAssingViewComponent,
    VacationsComponent,
    VacationsAddComponent,
    PermissionComponent,
    PermissionAddComponent,
    SettingsComponent,
    EmployesComponent,
    EmployeComponent,
    UnassignTurnComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatSliderModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [
    {
      provide: MAT_DATE_LOCALE, useValue: 'es-ES',
      useClass: DefaultMatCalendarRangeStrategy,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
