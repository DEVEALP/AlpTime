import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HomeService } from "./home.service";
import { Tools } from "./Tools";
import { newGlobalData } from "../components/newGlobaldata";

export type requestsInterface = 'post' | 'get'
export type valuesInterface = 'datatable1' | 'datatable2' | 'object1' | 'object2' | 'confirmation' | 'codeCapchat' | 'string1' | 'string2'

@Injectable({
   providedIn: 'root'
 })

 export class newHttpRequest {

  private api = '' 

  constructor(private notifications: HomeService, private router:Router) { }

  public auth = (url: string, body: any, values: valuesInterface[] = ['datatable1'], headers?: any) => this.request('post', 'auth/' + url, body, values, headers)
  
  public post = (url: string, body: any, values: valuesInterface[] = ['datatable1'], headers?: any) => this.request('post', 'dashboard/' + url, body, values, headers)

  public get = (url: string,  values: valuesInterface[] = ['datatable1'], headers?: any) => this.request('get', 'dashboard/' + url, undefined, values, headers)

  private request = (type: requestsInterface, url: string, body?: any, values: valuesInterface[] = ['datatable1'], headers?: any) => new Promise<void | string | object | any[]>(async (resolve, reject) => {
    await this.getApi()
    var api = newGlobalData.api + url
    var xhr = new XMLHttpRequest();
    var response = this.Results(values);
    xhr.open(type.toUpperCase(), api, true);
    this.addHeaders(xhr, headers)
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        if(xhr.status == 0){
          this.notifications.toast.fire({ title: "El servidor no está habilitado para recibir peticiones.", icon: 'error' })
          reject(xhr)
        }else if (xhr.status == 200) {
          var time_token = xhr.getResponseHeader('Time_token') ?? ''
          if (time_token) localStorage.setItem('Time_token', time_token)
          var token = xhr.getResponseHeader('Token') ?? ''
          if (token) localStorage.setItem('Token', token)
          try {
            var resultado = JSON.parse(xhr.responseText);
            if (Object.keys(values).length == 1) response = resultado[values[0]];
            else for (var type of values) { response[type] = resultado[type]; }
            resolve(response)
          } catch (err: any) {
            this.notifications.toast.fire({ title: "El servidor no respondió correctamente.", icon: 'error' })
            reject(xhr.responseText)
          }
        } else if (xhr.status == 400) {        // FORMULARIO O DATOS INCORRECTOS
          var error = JSON.parse(xhr.responseText);
          for(let key in error.errors){
            if(key != '' && key != 'body'){ 
              if(body[key]) this.notifications.toast.fire({ title: Tools.formatearCapitalizarTexto(key) + ' no es valido.', icon: 'error' })
              else this.notifications.toast.fire({ title: Tools.formatearCapitalizarTexto(key) + ' es requerido.', icon: 'error' })
              break;
            }
          }
          reject(error)
        } else if (xhr.status == 401) {        // SESION DE USUARIO FINALIDA O ERROR
          var message = 'Su sesión ha finalizado, inicie sesión nuevamente'
          this.notifications.toast.fire({ title: message, icon: 'error' })
          newGlobalData.logaut(this.router);
          reject(message)
        } else if (xhr.status == 404) {        // ERROR PARA EL USUARIO
          this.notifications.toast.fire({ title: xhr.responseText ? xhr.responseText : "No se ha encontrado datos para la petición", icon: 'error' })
          reject(xhr.responseText)
        } else if (xhr.status == 405) {        // AL PETICION NO SE ENCONTRO
          this.notifications.toast.fire({ title: 'No se encontró la API solicitada', icon: 'error' })
          reject()
        } else if (xhr.status == 423) {        // REQUIERE RECAPCHAT
          this.notifications.toast.fire({ title: 'Se requiere reCAPTCHA.', icon: 'error' })
          reject(xhr.responseText)       
        } else if (xhr.status == 500) {        //ERROR DE SISTEMA
          this.notifications.toast.fire({ title: 'Notifique a su asesor este error ocurrido.', icon: 'error' })
          reject(xhr.responseText)
        } else {                              //OTROS ERRORRES
          this.notifications.toast.fire({ title: xhr.responseText ?? 'Ha ocurrido un error', icon: 'error' })
          reject(xhr.responseText)
        }
      }
    }
    xhr.send(JSON.stringify(body ?? '{}'));
  })

  private getApi = () => new Promise((resolve) => {
    if (newGlobalData.api) {
      resolve('') 
    } else {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              var settings = JSON.parse(xhr.responseText)
              newGlobalData.api = settings.api
              resolve('')
            } catch {
              this.notifications.toast.fire({ icon: 'error', title: 'Configuración de aplicación invalida' })
              resolve('')
            }
          } else {
            this.notifications.toast.fire({ icon: 'error', title: 'No existe configuración para la aplicación' })
            resolve('')
          }
        }
      };
      xhr.open('GET', '/assets/setting.json', true);
      xhr.send();
    }
  })


  private addHeaders(xhr: XMLHttpRequest, headers?: any) {
    for (var key in headers) {
      xhr.setRequestHeader(key, headers[key] + '');
    }
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader('token', localStorage.getItem('Token') ?? '');
  }

  private Results(values: string[]) {
    if (values.length == 1) {
      return this.SubResults(values[0]);
    }
    else {
      var myreturn: any = {};
      for (var type of values) {
        myreturn[type] = this.SubResults(type);
      }
      return myreturn;
    }
  }

  private SubResults(type: string) {
    if (type == "datatable1" || type == "datatable2") {
      return [];
    }
    else if (type == "object1" || type == "object2") {
      return {};
    }
    else if (type == "confirmation") {
      return false;
    }
    else if (type == "code") {
      return 0;
    }
    else {
      return "";
    }
  }
}