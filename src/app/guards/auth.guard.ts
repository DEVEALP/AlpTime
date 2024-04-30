import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HomeService } from '../services/home.service';
import { Tools } from '../services/Tools';
import { newGlobalData } from '../components/newGlobaldata';

export const AuthGuard: CanActivateFn = (route, state) => {
  var notification = inject(HomeService)
  var router = inject(Router)
  var rute = state.url.split('/')[1]
  var dataUser = localStorage.getItem('dataUser') || ""
  var time_token = localStorage.getItem('Time_token') || ""
  var business = localStorage.getItem('business') || ""
  var apps_json = localStorage.getItem('apps') ?? ''
  var token = localStorage.getItem('Token') || ""
  var elapsed = Tools.elapsed_time('minutes', new Date(), Number(time_token)) ?? 0
  if(token.length > 0 && elapsed > 0){
    try{
      JSON.parse(dataUser);
      JSON.parse(business);
      var menu = JSON.parse(apps_json)
      if(menu.length > 0){
        var exist = menu.find((a:any)=> a.route_path == rute )
        if(exist || rute == 'settings'){
          return true;    
        }else{
          router.navigate(['/' + menu[0].route_path]) 
          return false;           
        }
      }else{
        return newGlobalData.logaut(router);
      }
    }catch{
      return newGlobalData.logaut(router);
    }
  }else{
    if(time_token.length > 0) notification.toast.fire({title:'Su sesión ha expirado, inicie sesión nuevamente.', icon:'error'})
    return newGlobalData.logaut(router);
  }
};
