import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../newGlobaldata';

@Component({
  selector: 'app-calendar-user-records',
  templateUrl: './calendar-user-records.component.html',
  styleUrls: ['./calendar-user-records.component.css']
})
export class CalendarUserRecordsComponent {

  date = ''
  records:any = [];
  loading = false;
  heigth = window.innerHeight - 100;
  nombresDias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  constructor(private router:Router, private route:ActivatedRoute, private home:HomeService, private http:newHttpRequest) {}

  ngOnInit() {
    newGlobalData.run()
    var app:any = newGlobalData.apps.find((e:any) => e.route_path == 'calendar_user')
    if(app){
      var settings:any = {}
      try {settings = JSON.parse(app.settings) }catch(e){ settings = {} }
      if(settings?.see_markings == null  || settings?.see_markings == true){
        var params:any = this.route.snapshot.params;
        if(params.date){
          var date = new Date(params.date + 'T05:00:00')
          if(date.toString() != 'Invalid Date'){
            this.getRecords(params.date);
            this.date = this.nombresDias[date.getDay()] + ', ' + date.getDate() + ' de ' + this.obtenerNombreMes(date.getMonth()) + ' del ' + date.getFullYear();
          }else{
            this.home.toast.fire({icon:'error', title:'Fecha invalida'});
            this.router.navigate(['/calendar_user']);
          }
        }else{
          this.router.navigate(['/calendar_user']);
        }
      }else{
        this.router.navigate(['/calendar_user']);
      }
    }else{
      this.router.navigate(['/calendar_user']);
    }
  }

  private obtenerNombreMes(mes: number) {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return nombresMeses[mes];
  }

  getRecords(date:string){
    this.loading = true;
    this.http.post('device/records/user/get', {date:date}).then((e: any) => {
      this.loading = false;
      console.log(e);
      for (let x of e){
        x.time_zone = Number(x.hora.split(':')[0]) > 12 ? 'PM' : 'AM'; 
        if(x.sensor == 'Palma') x.icon = 'front_hand'
        else if(x.sensor == 'Rostro') x.icon = 'mood'
        else if(x.sensor == 'Huella') x.icon = 'fingerprint'
        else if(x.sensor == 'Tarjeta') x.icon = 'payment'
        else x.icon = 'sensors'
      }
      this.records = e;
    }).catch((e: any) => {
      this.loading = false;
      this.router.navigate(['/calendar_user']);
    })
  }
}

