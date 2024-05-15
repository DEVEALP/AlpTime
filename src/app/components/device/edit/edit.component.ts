import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';
import { newGlobalData } from '../../newGlobaldata';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditDComponent {

  AllWidth = true
  mobile = window.innerWidth < 601
  save_state = false
  device:any = {}
  timeZones = [
    {name: 'Argentina	Buenos Aires', value:'-3'},
    {name: 'Costa Rica', value:'-6'},
    {name: 'Ecuador	Quito', value:'-5'},
    {name: 'Portugal Lisboa', value:'0'},
    {name: 'PUERTO RICO	San Juan', value:'-4'},
    {name: 'Venezuela	Caracas', value:'-4:30'}
  ]
  languages = [
    {name: 'Español', value:'101'},
    {name: 'Ingles', value:'69'}
  ]
  form = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    sn: new FormControl<string | null>(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    ubication: new FormControl<string | null>(null, [Validators.required]),
    timezone: new FormControl<string | null>(null, [Validators.required]),
    language: new FormControl<string | null>(null, [Validators.required]),
    volume: new FormControl<number>(0, [Validators.required]),
    ip: new FormControl<string | null>(null, [Validators.required]),
    port: new FormControl<number | null>(null, [Validators.required, Validators.min(10), Validators.max(99999)]),
    allow: new FormControl<boolean | null>(null),
  });

  ngOnInit(){
    var params: any = this.router_actived.snapshot.params;
    if (params?.id == undefined || params.id == '') {
      this.homesvc.toast.fire({icon:'error', title:'No se encontro el dispositivo biometrico'})
      this.router.navigate(['../devices'])
    } else {
      this.device = params
    }
    this.load()
  }

  ngAfterViewInit(){
    var elemento = document.getElementById('card')
    if(elemento && elemento.clientWidth / 2 < 300) this.AllWidth = true
  }

  load(){
    this.homesvc.loading.emit(true)
    this.http.post('device/get', {device_id: Number(this.device.id), value: ''}).then((e:any)=>{
      if(e.length > 0){
        this.form.controls.name.setValue(e[0].name);
        this.form.controls.sn.setValue(e[0].sn);
        this.form.controls.ubication.setValue(e[0].ubication);
        this.form.controls.timezone.setValue(e[0].timezone.trim());
        this.form.controls.ip.setValue(e[0].ip);
        this.form.controls.port.setValue(e[0].port);
        this.form.controls.volume.setValue(e[0].volume);
        this.form.controls.language.setValue(e[0].language);
        this.form.controls.allow.setValue(e[0].allow);
        this.form.controls.sn.disable()
        this.form.controls.ip.disable()
      }else{
        this.homesvc.toast.fire({icon:'error', title:'No se encontro el dispositivo biometrico'})
        this.router.navigate(['../devices'])
      }
      this.homesvc.loading.emit(false)
    }).catch(()=>{
      this.homesvc.loading.emit(false)
    })
  }

  @Output() updateInformation = new EventEmitter<any>();

  constructor(private router_actived: ActivatedRoute, private router: Router, private homesvc:HomeService, private http:newHttpRequest){}

  save(){
    if(this.form.valid){
      if(!this.save_state){
        this.homesvc.loading.emit(true)
        this.save_state = true
        this.form.controls.sn.enable()
        this.form.controls.ip.enable()
        var body:any = this.form.value
        body.action = 'update'
        body.device_id = this.device.id
        this.http.post('device/options', body).then(()=>{
          this.homesvc.loading.emit(false)
          this.save_state = false
          this.homesvc.toast.fire({icon: 'success', title: 'Se actualizó la información del dispositivo con éxito' })
          this.form.controls.sn.disable()
          this.form.controls.ip.disable()
        }).catch(()=>{
          this.homesvc.loading.emit(false)
          this.save_state = false
          this.form.controls.sn.disable()
          this.form.controls.ip.disable()
        })
      }
    }else{
      this.homesvc.toast.fire({icon: 'error', title: 'Verifique el formulario' })
    }
  }

}
