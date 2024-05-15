import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.css']
})
export class ReportDetailComponent {

  user:any = {id: 0, name: '', date:''}
  records:any[] = []

  constructor(private home:HomeService, private router:Router, private actived_router:ActivatedRoute, private http:newHttpRequest) { }

  ngOnInit(){
    var path:any = this.actived_router.snapshot.params
    if(path?.code && path?.name && path?.date) this.user = {id: path.code, name: path.name, date: path.date}
    else this.router.navigate(['../attendance_delays'])
    this.load();
  }

  load() {
    var body = { device_id: 1, value: this.user.name, group: '', start_date: this.user.date, end_date: this.user.date, property: '', order: '' }
    this.http.post('device/records/get', body).then((e:any) => {
      this.records = e
      this.home.loading.emit(false)
    }).catch(() => {
      this.home.loading.emit(false)
    })
  }

  formatearFecha(input: string | Date) {
    let fecha;
    if (typeof input === 'string') fecha = new Date(input);
    else if (input instanceof Date) fecha = input;
    else return 'Formato no válido'
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Sumar 1 porque los meses en JavaScript van de 0 a 11
    const año = fecha.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${año}`;
    return fechaFormateada;
 }
}
