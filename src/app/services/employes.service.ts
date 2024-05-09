import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployesService {

  constructor() { }

  employe:any = {id: 0, nombre: '', apellido: '', cedula: '', userid: 0, brithday: '', estudio: '', sexo: '', ecivil: '', telefono: '', email: '', direccion: '', allow: 0}
}
