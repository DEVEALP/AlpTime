import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { UserEditComponent } from '../../user-edit/user-edit.component';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {

  device: any = { id: 0, name: '' }
  old_search = ''
  property = ''
  order = ''
  groups: any = []
  users: any = []
  timer: any = null
  text = new FormControl<string>('')
  constructor(private router_actived: ActivatedRoute, private router: Router, private homesvc: HomeService, private dialog: MatDialog, private http: newHttpRequest) { }

  ngOnInit() {
    var params: any = this.router_actived.snapshot.params;
    if (params?.id == undefined || params.id == '') {
      this.router.navigate(['../devices'])
    } else {
      this.device = params
    }
    this.loadGroups()
    this.load();
  }

  loadGroups() {
    this.http.get('device/groups/get?value=',).then((e: any) => {
      this.groups = e
    }).catch(() => { })
  }

  load() {
    this.homesvc.loading.emit(true)
    this.http.post('device/users/get', { type: 'max', top: 30, deviceid: this.device.id, search: this.text.value ?? '' }).then((e: any) => {
      this.homesvc.loading.emit(false)
      this.users = e;
      for (let x of this.users) if (x.imagen) x.imagen = 'data:image/jpeg;base64,' + x.imagen
    }).catch(() => {
      this.homesvc.loading.emit(false)
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
  add(data?: any) {
    const dialogRef = this.dialog.open(UserEditComponent, { data: { user: data, groups: this.groups, device: this.device, mode: false }, width: '500px', panelClass: 'editUser' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.homesvc.loading.emit(true)
        if (result.action == 'save') {
          var data = result.data
          data.mode = 1
          this.http.post('device/users/options', data).then((e: any) => {
            this.homesvc.toast.fire({ icon: 'success', title: 'Guardado con exito' })
            data.grupo = data.grupo_name
            data.userid = data.id
            this.users.push(data)
            this.homesvc.loading.emit(false)
          }).catch(() => {
            this.homesvc.loading.emit(false)
          })
        } else {
          data.mode = 3
          this.http.post('device/users/options', data).then((e: any) => {
            var index = this.users.findIndex((u: any) => u.id == data.userid)
            if (index > -1) this.users.splice(index, 1)
            this.homesvc.toast.fire({ icon: 'success', title: 'Eliminado con exito' })
            this.homesvc.loading.emit(false)
          }).catch(() => {
            this.homesvc.loading.emit(false)
          })
        }
      }
    })
  }

  editUser(user: any) {
    const dialogRef = this.dialog.open(UserEditComponent, { data: { user: user, groups: this.groups, device: this.device, mode: true }, width: '500px', panelClass: 'editUser' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action == 'save') {
          this.homesvc.loading.emit(true)
          result = result.data
          result.mode = 2
          this.http.post('device/users/options', result).then((e: any) => {
            this.homesvc.loading.emit(false)
            this.homesvc.toast.fire({ icon: 'success', title: 'Actualizado con exito' })
            result.grupo = result.grupo_name
            result.userid = result.id
            result.imagen = user.imagen
            var index = this.users.findIndex((u: any) => u.userid == result.userid)
            if (index > -1) this.users[index] = result
          }).catch(() => {
            this.homesvc.loading.emit(false)
          })
        } else {
          var body = {mode: 3, deviceid: this.device.id, id: user.userid, name: '', cedula: '', grupo: ''}
          this.http.post('device/users/options', body).then((e: any) => {
            var index = this.users.findIndex((u: any) => u.userid == body.id)
            if (index > -1) this.users.splice(index, 1)
            this.homesvc.toast.fire({ icon: 'success', title: 'Eliminado con exito' })
            this.homesvc.loading.emit(false)
          }).catch(() => {
            this.homesvc.loading.emit(false)
          })
        }
      }
    })
  }

  writing() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.text.value != this.old_search) { this.old_search = this.text.value ?? ''; this.load() }
      clearInterval(this.timer);
    }, 600)
  }
}
