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
    const dialogRef = this.dialog.open(AlertComponent, {data: data, 'width' : (data.width ? data.width : '300')+'px', panelClass: 'alert-container', disableClose:data?.hiddenButtonCancel});
    dialogRef.afterClosed().subscribe((result:any) => { if(result){resolve(result)}else{reject(false)} });
  })

  loading = new EventEmitter<boolean>();
  getreturn = new EventEmitter<any>();
  setreturn = new EventEmitter<any>();
  changepage = new EventEmitter<string>();

  createImage(image: any, original_width: number, original_heigth: number, max_width: number, max_height: number): string {
    var canvas = <HTMLCanvasElement>document.createElement('canvas');
    const ctx: any = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    var width = 0
    var height = 0
    var x = 0
    var y = 0
    if (original_width < max_width || original_heigth < max_height) {
      this.toast.fire({ icon: 'error', title: `Mínimo de dimensiones requeridas es de ${max_width} x ${max_height}` })
      return ''
    }
    if (original_width > original_heigth) {
      if (max_width == max_height) {
        height = max_height
        var exedent = ((original_width - original_heigth) / original_heigth) * max_height
        width = height + exedent
        x = exedent / 2
      } else {
        width = max_width
        max_height = (original_heigth / original_width) * max_width
        var exedent = ((original_heigth - original_width) / original_width) * max_width
        height = width + exedent
      }
    } else {
      if (max_width == max_height) {
        width = max_width
        var exedent = ((original_heigth - original_width) / original_width) * max_width
        height = width + exedent
        y = exedent / 2
      } else {
        height = max_height
        max_width = (original_width / original_heigth) * max_height
        var exedent = ((original_width - original_heigth) / original_heigth) * max_height
        width = height + exedent
      }
    }
    canvas.width = max_width;
    canvas.height = max_height;
    ctx.drawImage(image, -x, -y, width, height);
    return canvas.toDataURL('image/png', 0.4).replace(/^data:image\/(png|jpg);base64,/, '')
  }

  tGenerate(cant: number) {
    let caracteres = "abcdefghijkmnpqrtuvwxyz_ABCDEFGHJKMNPQRTUVWXYZ123467890-";
    let token = "";
    for (let i=0; i<cant; i++) {token += caracteres.charAt(Math.floor(Math.random()*caracteres.length));}
    return token; 
  }
}
