import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { HomeService } from "./home.service";
export type requestsInterface = 'post' | 'get'

@Injectable({
   providedIn: 'root'
 })
 export class HttpRequest {

   token = ''

   constructor(private homesvc:HomeService, private router:Router){}

   request = (type:requestsInterface, url:string, body?:any) => new Observable<any>(observer => {
      if(this.token == ''){ this.token = localStorage.getItem('token') ?? '' }
      var xhr = new XMLHttpRequest(); 
      xhr.open(type.toUpperCase(), url, true); 
      xhr.setRequestHeader('token', this.token?.toString() ?? '');
      xhr.onreadystatechange = ()=>{ 
         if (xhr.readyState == 4) {
            if(xhr.status == 200){   
               var headers = [] 
               var string_headers = xhr.getAllResponseHeaders().toString().trim().split(`\r\n`);
               for(let x of string_headers){
                  var subhead = x.split(':')
                  if(subhead.length == 2 && subhead[0].length > 0 && subhead[1].length > 0){ headers.push({name:subhead[0], value: subhead[1]}) }
               }
               var indextoken = headers.findIndex((t:any)=> t.name == 'token')
               if(indextoken > -1){ localStorage.setItem('token', headers[indextoken].value) }
               var response = JSON.parse(xhr.response);             
               if(response.code == 200){
                  observer.next(response.body)
               }else if(response.code == 401){
                  localStorage.removeItem('token')
                  localStorage.removeItem('dataUser')
                  this.token = '';
                  this.router.navigate(['../auth'])
                  this.homesvc.toast.fire({title: 'El token ha expirado', icon:'error'})
                  observer.next([])
               }else{
                  this.homesvc.toast.fire({title: response.message ?? 'Ha ocurrido un error', icon:'error'})
               }
               observer.complete();
            }else{
               this.homesvc.toast.fire({icon: 'error', title: 'No se cargaron los dispositivos' })
               observer.error();
               observer.complete();
            }
         }
      }
      xhr.send(JSON.stringify(body));
   })
 }