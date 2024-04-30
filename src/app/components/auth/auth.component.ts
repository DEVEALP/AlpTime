import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { newGlobalData } from '../newGlobaldata';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  device = { system: '', code: '', navigator: '' }
  loading = false
  hide = true
  form = new FormGroup({
    username:new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]), 
    password: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    business: new FormControl(1, [Validators.required])
  })
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

  constructor(private router:Router, private home:HomeService, private http:newHttpRequest){}

  ngOnInit(){
    try{
      var token = localStorage.getItem('Token') ?? ''
      var apps = JSON.parse(localStorage.getItem('apps') ?? '')
      if(apps.length > 0 && token.length > 10) this.router.navigate(['../' + apps[0].route_path])  
    }catch{

    }
  }

  getfingerprint = () => new Promise<string>(async (resolve) => {
    const fpPromise = FingerprintJS.load()
    const fp = await fpPromise
    const result = await fp.get()
    resolve(result.visitorId)
  })

  async getInfDevice() {
    var userAgent = navigator.userAgent;
    var indexStartSystem = userAgent.indexOf("(") + 1;
    var indexEndSystem = userAgent.indexOf(")");
    var system = userAgent.substring(indexStartSystem, indexEndSystem)
    this.device.system = system
    this.device.navigator = this.getBrowserName(userAgent);
    this.device.code = await this.getfingerprint();
  }

  getBrowserName(userAgent:string) {
    if (userAgent.indexOf("Firefox") > -1) return "Firefox";
    else if (userAgent.indexOf("Chrome") > -1) return "Chrome";
    else if (userAgent.indexOf("Safari") > -1) return "Safari";
    else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) return "Opera";
    else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) return "Edge";
    else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer";
    else return "Unknown"; 
}

  auth(){
    if (!this.loading) {
      if (this.form.valid) {
        this.loading = true
        var body:any = this.form.value;
        body.device = this.device
        this.http.auth('auth', body, ['datatable1', 'datatable2']).then((resp:any) => {
          this.loading = false
          if(resp?.datatable1){
            var code = resp.datatable1[0].code
            if(code == 200){
              this.next(resp.datatable1[0], resp.datatable2)
            }else{
              this.home.toast.fire({ icon: 'error', title: 'Comuniquese con su asesor' })
            }
          }else{
            this.home.toast.fire({ icon: 'error', title: 'Ha ocurrido un error al realizar la petición' })
          }
        }).catch(() => {
          this.loading = false
        })
       } else {
          this.loading = false
          this.home.toast.fire({ icon: 'error', title: 'Revise el formulario' })
        }
      }
  }

  next(data:any, apps:any[]){
    localStorage.setItem('business', JSON.stringify([]));
    localStorage.setItem('dataUser', JSON.stringify(data));
    localStorage.setItem('apps', JSON.stringify(apps));
    var path = '../' + apps[0].route_path
    this.router.navigate([path])
  }
}
