import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { NotificationOptionComponent } from '../notification-option/notification-option.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {

  events:any[] = []
  loading = true
  device:any

  constructor(private dialog:MatDialog, private home:HomeService, private http:newHttpRequest, private router:ActivatedRoute) { }

  ngOnInit(): void {
    this.device = this.router.snapshot.params
    this.load()
  }

  load(){
    this.http.get('device/sms/get?device_id=' + this.device?.id).then((data:any) => {
      this.loading = false
      console.log(data)
      this.events = data
    }).catch((error:any) => {
      this.loading = false
    })
  }

  setEvent(){
    var dialog_ref = this.dialog.open(NotificationOptionComponent, {data: Number(this.device.id), width: '350px', panelClass: 'viewUser'})
    dialog_ref.afterClosed().subscribe((result:any) => {
      if(result) this.events.push(result)
    })
  }

  remove(x:any){
    if(!x.loading){      
      x.loading = true
      this.http.get('device/sms/remove?uid=' + x.uid + '&device_id=' + this.device.id, ['object1']).then((data:any) => {
        x.loading = false
        this.home.toast.fire({icon: 'success', title: 'Notificación eliminada'})
        var index = this.events.findIndex((e:any) => e.uid == x.uid)
        if(index > -1) this.events.splice(index, 1)
      }).catch((error:any) => {
        x.loading = false
      })
    }
  }
}
