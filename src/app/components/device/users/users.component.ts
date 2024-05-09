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
  users: any[] = []
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
    this.load();
  }

  load() {
    this.homesvc.loading.emit(true)
    this.http.post('device/users/get', { type: 'user_min', top: 30, deviceid: this.device.id, search: this.text.value ?? '' }).then((e: any) => {
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

  view_user(data?: any) {
    if(data){
      this.homesvc.loading.emit(true)
      this.http.post('device/users/get', {top: 0, search:data.id, deviceid: this.device.id, type:'user' }).then((resp:any)=>{
        this.homesvc.loading.emit(false)
        console.log(resp)
        if(resp.length > 0){
          this.setUser(resp[0])
        }else{
          this.homesvc.toast.fire({icon:'error', title:'No se encontro el usuario'})
        }
      }).catch(()=>{
        this.homesvc.loading.emit(false)
      })
    }else{
      this.setUser()
    }
  }

  setUser(user?:any){
    if(!user) user = {device_id: this.device.id, id:0}
    const dialogRef = this.dialog.open(UserEditComponent, { data:user, width: '550px', disableClose:true, maxWidth:'86vw', panelClass: 'viewUser' });
    dialogRef.afterClosed().subscribe((data:any)=>{
      if(data){
        if(user?.id){
          var index = this.users.findIndex((x:any)=>x.id == user.id)
          if(index >= 0){
            this.users[index].name = data
            this.users[index].confirmed = false
          }
        }else{
          this.users.unshift(data)
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
