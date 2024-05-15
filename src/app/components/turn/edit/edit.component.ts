import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { SelectTurnComponent } from '../select-turn/select-turn.component';
import { AssignedTurnComponent } from '../../assigned-turn/assigned-turn.component';
import { FilterAssingTurnComponent } from '../../filter-assing-turn/filter-assing-turn.component';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { UnassignTurnComponent } from '../../unassign-turn/unassign-turn.component';

@Component({
  selector: 'app-edit-turn',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditTComponent {

  selection_all = false
  turn = { id: 0, name: '' }
  filters: any = { area: null, job: null, office: null, turn: null, group: null }
  old_search = ''
  order = ''
  property = ''
  timer: any = null
  text = new FormControl<string>('')
  users: any = []
  mobile = innerWidth < 600
  area: any = []
  job: any = []
  office: any = []
  turns: any = []
  groups: any = []
  users_selected: any[] = []
  filters_actived = 0
  filters_laoding = true

  constructor(private homesvc: HomeService, public dialog: MatDialog, private http:newHttpRequest) { }
  ngOnInit() {
    this.getFilters();
    this.load();
  }

  async getFilters() {
    await this.getTurns()
    await this.getGroups()
    await this.getOptions()
    this.filters_laoding = false
  }

  load_turns = () => new Promise<void>((resolve, reject) => {
    this.http.post('turn/get', { value: '' }).then((e: any) => {
      this.turns = e;
      resolve()
    }).catch((e) => {
      resolve()
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
  
  unassign_turn(){
    if (this.users_selected.length >= 0) {
      const dialogRef = this.dialog.open(UnassignTurnComponent, { data: this.users_selected, 'width': '340px', disableClose: true, panelClass: 'asignUser' })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.users_selected = []
          this.load()
        }
      })
    } else {
      this.homesvc.toast.fire({ title: 'Agrege algun empleado para asignar el turno', icon: 'warning' })
    }
  }

  load() {
    this.homesvc.loading.emit(true)
    var body = this.filters
    body.value = this.text.value ?? ''
    body.office = body.office ?? ''
    body.job = body.job ?? ''
    body.departament = body.area ?? ''
    body.turn = body.turn ?? 0
    body.group = body.group ?? ''
    body.user = body?.user ?? 0
    this.http.post('turn/users', body).then((e: any) => {
      this.homesvc.loading.emit(false)
      this.users = e;
    }).catch(() => {
      this.homesvc.loading.emit(false)
    })
  }

  formatearFecha(input: string | Date) {
    let fecha;
    if (typeof input === 'string') fecha = new Date(input);
    else if (input instanceof Date) fecha = input;
    else return ''
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Sumar 1 porque los meses en JavaScript van de 0 a 11
    const año = fecha.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    return fechaFormateada;
  }

  setFilters() {
    if (this.filters_laoding) return
    var open_dialog = this.dialog.open(FilterAssingTurnComponent, { data: { filter_users :true,filters: this.filters, area: this.area, job: this.job, office: this.office, groups: this.groups, turns: [] }, 'width': '320px', disableClose: true, panelClass: 'asignUser' })
    open_dialog.afterClosed().subscribe((result: any) => {
      if(result){
        this.filters_actived = 0
        for (let key in result) if (result[key] != null) { this.filters_actived++ }
        this.filters = result
        this.load()
      }
    })
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
  seletedUser(user: any) {
    var index = this.users_selected.findIndex((x: any) => x.userid == user.userid)
    if (index > -1) {
      user.seleted = false
      this.users_selected.splice(index, 1)
    } else {
      this.users_selected.push(user)
      user.seleted = true
    }
  }

  changeStatusUser(user: any) {
    var index = this.users_selected.findIndex((x: any) => x.userid == user.userid)
    if (index > -1) {
      this.users_selected.splice(index, 1)
    } else {
      this.users_selected.push(user)
    }
  }

  seletedAll() {
    for (let user of this.users) {
      var index = this.users_selected.findIndex((x: any) => x.userid == user.userid)
      if (this.selection_all) {
        if (index > -1) { this.users_selected.splice(index, 1); user.seleted = false }
      } else {
        if (index == -1) { this.users_selected.push(user); user.seleted = true }
      }
    }
    this.selection_all = !this.selection_all
  }
  selected_turn() {
    if (this.users_selected.length >= 0) {
      const dialogRef = this.dialog.open(AssignedTurnComponent, { data: { turns: this.turns, users: this.users_selected }, 'width': '340px', disableClose: true, panelClass: 'asignUser' })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.users_selected = []
          this.load()
        }
      })
    } else {
      this.homesvc.toast.fire({ title: 'Agrege algun empleado para asignar el turno', icon: 'warning' })
    }
  }
  writing() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.text.value != this.old_search) { this.old_search = this.text.value ?? ''; this.load() }
      clearInterval(this.timer);
    }, 600)
  }
  changeorder() {
    if (this.order == 'asc') {
      this.order = 'desc'
    } else {
      this.order = 'asc'
    }
    this.load();
  }

  selectItems(data: any, title: string, property: string): void {
    const dialogRef = this.dialog.open(SelectTurnComponent, {
      data: { list: data, title: title, all: true, value_all: { codigo: '', nombre: 'Todos' } },
      'width': '340px',
      panelClass: 'itemMenu-container'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.filters[property] = result
        this.load();
      }
    });
  }
}
