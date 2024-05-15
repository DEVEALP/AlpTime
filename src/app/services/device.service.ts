import { Injectable } from '@angular/core';
interface view_records { userid:number, deviceid:number, date:string, url:string }
interface view_report { userid:number, date_start:string, date_end:string }
interface view_user_biometric { userid:number, deviceid:number, url:string }

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor() { }

  view_records:view_records | undefined 
  report_user:view_report | undefined 
  view_user_biometric:view_user_biometric | undefined
}
