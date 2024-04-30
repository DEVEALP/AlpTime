import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, map, startWith } from 'rxjs';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-filter-assing-turn',
  templateUrl: './filter-assing-turn.component.html',
  styleUrls: ['./filter-assing-turn.component.css']
})
export class FilterAssingTurnComponent {

  old_user_search = ''

  timer:any

  loading_users = false
  filter_users = false
  btn_restablecer = false

  office_code: string | undefined
  departament_code: string | undefined
  job_code: string | undefined
  turn_code: number | undefined
  group_code: string | undefined
  user_code: string | undefined
  calendar_code: any | undefined

  form = new FormGroup({
    office: new FormControl(''),
    departament: new FormControl(''),
    job: new FormControl(''),
    turn: new FormControl(''),
    group: new FormControl(''),
    user: new FormControl(''),
    calendar: new FormControl(''),
    period: new FormControl(0)
  });

  offices: any[] = []
  departaments: any[] = []
  jobs: any[] = []
  turns: any[] = []
  groups: any[] = []
  users: any[] = []
  calendar: any[] = []
  periods: number[] = []

  filteredOptionsOffices: Observable<any[]> | undefined;
  filteredOptionsDepartaments: Observable<any[]> | undefined;
  filteredOptionsJobs: Observable<any[]> | undefined;
  filteredOptionsTurns: Observable<any[]> | undefined;
  filteredOptionsGroups: Observable<any[]> | undefined;
  filteredOptionsUsers: Observable<any[]> | undefined;
  filteredOptionsCalendar: Observable<any[]> | undefined;

  constructor(private http:newHttpRequest, public dialogRef: MatDialogRef<FilterAssingTurnComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    console.log(this.data);
    this.offices = this.data.office;
    this.departaments = this.data.area;
    this.jobs = this.data.job;
    this.turns = this.data?.turns ?? [];
    this.groups = this.data.groups;
    this.calendar = this.data?.calendar ?? [];
    this.periods = this.data?.periods ?? [];

    var filters = this.data.filters;

    var office = this.offices?.find((e: any) => e.codigo === filters.office)
    var departament = this.departaments.find((e: any) => e.codigo === filters.area)
    var job = this.jobs.find((e: any) => e.codigo === filters.job)
    var turn = this.turns.find((e: any) => e.id === filters.turn)
    var group = this.groups.find((e: any) => e.codigo === filters.group)
    var calendar = this.calendar.find((e: any) => e.value1 === filters.calendar?.value1 && e.value2 === filters.calendar?.value2)

    this.form.controls.office.setValue(office?.nombre)
    this.form.controls.departament.setValue(departament?.nombre)
    this.form.controls.job.setValue(job?.nombre)
    this.form.controls.turn.setValue(turn?.turn_name)
    this.form.controls.group.setValue(group?.nombre)
    this.form.controls.calendar.setValue(calendar?.nombre)
    this.form.controls.period.setValue(filters?.period)

    this.office_code = office?.codigo
    this.departament_code = departament?.codigo
    this.job_code = job?.codigo
    this.turn_code = turn?.id
    this.group_code = group?.codigo
    if(calendar?.value1 && calendar?.value2) this.calendar_code = {value1: calendar.value1, value2: calendar.value2}

    this.filter_users = this.data.filter_users

    if(this.office_code || this.departament_code || this.job_code || this.turn_code || this.group_code || filters.user || this.calendar_code || filters.period) this.btn_restablecer = true
    this.setValuesForm()
    this.load_users(filters.user ?? 'A')
  }

  setValuesForm() {
    this.filteredOptionsOffices = this.form.controls.office.valueChanges.pipe(startWith(''), map(value => this._filter(this.offices, 'nombre', value)));
    this.filteredOptionsDepartaments = this.form.controls.departament.valueChanges.pipe(startWith(''), map(value => this._filter(this.departaments, 'nombre', value)));
    this.filteredOptionsJobs = this.form.controls.job.valueChanges.pipe(startWith(''), map(value => this._filter(this.jobs, 'nombre', value)));
    this.filteredOptionsTurns = this.form.controls.turn.valueChanges.pipe(startWith(''), map(value => this._filter(this.turns, 'turn_name', value)));
    this.filteredOptionsGroups = this.form.controls.group.valueChanges.pipe(startWith(''), map(value => this._filter(this.groups, 'nombre', value)));
    this.filteredOptionsCalendar = this.form.controls.calendar.valueChanges.pipe(startWith(''), map(value => this._filter(this.calendar, 'nombre', value)));
  }

  writing() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.form.controls.user.value != this.old_user_search) { this.old_user_search = this.form.controls.user.value ?? ''; this.load_users() }
      clearInterval(this.timer);
    }, 600)
  }

  seletecUser(user: any) {
    clearImmediate(this.timer)
    this.form.controls.user.setValue(user.name)
    this.user_code = user.userid
  }

  load_users(internal_value?: string) {
    if (this.old_user_search.length > 0 || internal_value) {
      this.loading_users = true
      var search = this.old_user_search
      if (internal_value) search = internal_value
      this.http.post('device/users/get', {type: 'min', deviceid:0, search: search, top: 5}).then((data: any) => {
        this.users = data
        if(this.data.filters.user){
          var user = this.users.find((e: any) => e.userid === this.data.filters.user)
          if(user){
            this.form.controls.user.setValue(user.name)
            this.user_code = user.userid
          }
        }else{
          this.filteredOptionsUsers = this.form.controls.user.valueChanges.pipe(startWith(''), map(value => this._filter(this.users, 'name', value)));
        }
        this.loading_users = false
      }).catch(() => {
        this.loading_users = false
      })
    }
  }

  reset() {
    this.form.controls.office.setValue('');
    this.form.controls.departament.setValue('');
    this.form.controls.job.setValue('');
    this.form.controls.turn.setValue('');
    this.form.controls.group.setValue('');
    this.form.controls.user.setValue('');
    this.form.controls.period.setValue(null);
    this.form.controls.calendar.setValue('');
    this.office_code = undefined;
    this.departament_code = undefined;
    this.job_code = undefined;
    this.turn_code = undefined;
    this.user_code = undefined;
    this.group_code = undefined;
    this.calendar_code = undefined;
    this.setValuesForm()
    this.dialogRef.close({area: null,job: null,office: null,turn: null,group: null, user:null, calendar:null, period:null});
  }

  blur_input(){
    this.timer = setInterval(() => {
      if(this.form.controls.user.value === ''){
        this.users = []
        this.load_users('A')
      }
    }, 1000)
  }

  setCalendar(value: any) {
    this.calendar_code = {value1: value.value1, value2: value.value2}
  }

  save() {
    var filters:any = {area: null,job: null,office: null,turn: null,group: null, user: null, calendar: null, period: null}

    var office = this.offices.find((e: any) => e.nombre === this.form.controls.office.value && e.codigo === this.office_code)
    var departament = this.departaments.find((e: any) => e.nombre === this.form.controls.departament.value && e.codigo === this.departament_code)
    var job = this.jobs.find((e: any) => e.nombre === this.form.controls.job.value && e.codigo === this.job_code)
    var turn = this.turns.find((e: any) => e.turn_name === this.form.controls.turn.value && e.id === this.turn_code)
    var group = this.groups.find((e: any) => e.nombre === this.form.controls.group.value && e.codigo === this.group_code)
    var user = this.users.find((e: any) => e.name === this.form.controls.user.value && e.userid === this.user_code)
    var calendar = this.calendar.find((e: any) => e.nombre === this.form.controls.calendar.value && e.value1 === this.calendar_code?.value1 && e.value2 === this.calendar_code?.value2)

    filters.office = office?.codigo
    filters.area = departament?.codigo
    filters.job = job?.codigo
    filters.turn = turn?.id
    filters.group = group?.codigo
    filters.user = user?.userid
    filters.period = this.form.controls.period.value
    if(calendar) filters.calendar = {value1: calendar?.value1, value2: calendar?.value2}

    this.dialogRef.close(filters);
  }

  closed(): void {
    this.dialogRef.close();
  }

  private _filter(data: any[], proeprty: string, value?: string | null): string[] {
    const filterValue = value?.toLowerCase() ?? '';
    return data.filter((option: any) => option[proeprty]?.toLowerCase()?.includes(filterValue));
  }
}
