import { Injectable, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';
import { AlertComponent, AlertInterface } from '../components/alert/alert.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private dialog:MatDialog) { }

  toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  alert = (data:AlertInterface)=> new Promise<any>((resolve, reject)=>{
    const dialogRef = this.dialog.open(AlertComponent, {data: data, 'width' : '300px', panelClass: 'alert-container', disableClose:data?.hiddenButtonCancel});
    dialogRef.afterClosed().subscribe((result:any) => { if(result){resolve(result)}else{reject(false)} });
  })

  loading = new EventEmitter<boolean>();
  getreturn = new EventEmitter<any>();
  setreturn = new EventEmitter<any>();
  changepage = new EventEmitter<string>();
}
