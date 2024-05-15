import { Component } from '@angular/core';
import { FormControl, FormGroup,  Validators } from '@angular/forms';
import { HomeService } from 'src/app/services/home.service';
export interface Time {
  hour: number;
  minute: number;
  second: number;
}
@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent {

  form = new FormGroup({
    name: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    he1: new FormControl<any>('08:00', [Validators.required, this.validTime]),
    he2: new FormControl(''),
    hs1: new FormControl(''),
    hs2: new FormControl<any>('17:00', [Validators.required, this.validTime]),
    rotative: new FormControl<boolean>(false),
    tolerance: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    turn_start_date: new FormControl<Date | null>(null),
    turn_end_Date: new FormControl<Date | null>(null),
    turn_start_time: new FormControl<string | null>(null),
    turn_end_time: new FormControl<string | null>(null)
  })

  addDaysToDate(date:any, days:number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  constructor(private homesvc:HomeService){}

  ngOnInit(){

  }
  
  validTime(control: any): { [key: string]: boolean } | null {
    var time = control.value
    if(time.length > 5 && time.length < 5){ return {invalidTime: true} }
    var spacing = time.split(':')
    if(spacing.length != 2){ return {invalidTime: true} }
    var hours = Number(spacing[0])
    var minutes = Number(spacing[1])
    if(typeof(hours) != 'number' || typeof(minutes) != 'number'){ return {invalidTime: true} }
    if( hours < 0 || hours > 24 ){ return {invalidTime: true} }
    if( minutes < 0 || minutes > 60 ){ return {invalidTime: true} }
    return null;
  }
  changeRotation(){
    var val = !this.form.controls.rotative.value
    this.form.controls.rotative.setValue(val)
    if(val){
      this.form.controls.turn_start_date.setValidators([Validators.required])
      this.form.controls.turn_end_Date.setValidators([Validators.required])
      this.form.controls.turn_start_time.setValidators([Validators.required, this.validTime])
      this.form.controls.turn_end_time.setValidators([Validators.required, this.validTime])
      
      this.form.controls.turn_start_date.setValue(new Date())
      this.form.controls.turn_end_Date.setValue(this.addDaysToDate(new Date(), 7))
      this.form.controls.turn_start_time.setValue('00:00')
      this.form.controls.turn_end_time.setValue('23:59')
    }else{
      this.form.controls.turn_start_date.clearValidators();
      this.form.controls.turn_end_Date.clearValidators();
      this.form.controls.turn_start_time.clearValidators();
      this.form.controls.turn_end_time.clearValidators();
      this.form.controls.turn_start_date.setValue(null);
      this.form.controls.turn_end_Date.setValue(null);
      this.form.controls.turn_start_time.setValue(null);
      this.form.controls.turn_end_time.setValue(null);
    }
  }
  getDateTime(data:any, type:string, hours:string){
    if(!isNaN(Date.parse(data[type])) && data[hours].length == 5){
      var date = data[type].toISOString().split('T')
      date = date[0] + 'T' + data[hours] + ':00.000Z'
      return date
    }else{
      return ''
    }
  }
  save(){
    if(this.form.valid){
      this.homesvc.loading.emit(true)
      var body:any = this.form.value;
      body.turn_start = this.getDateTime(this.form.value, 'turn_start_date', 'turn_start_time')
      body.turn_end = this.getDateTime(this.form.value, 'turn_end_Date', 'turn_end_time')
      // this.form.value.turn_start_date?.toISOString()?.split('T')[0] + this.form.value.turn_start_time + ':00.000Z'
      //this.turnssvc.save_turn(body).subscribe({
      //  next:(data:any)=>{
      //    this.homesvc.loading.emit(false)
      //    if(data.state){
      //      this.homesvc.toast.fire({icon: 'success', title: 'Se creo el turno con exito' })
      //      this.homesvc.getreturn.emit()
      //    }else{
      //      this.homesvc.toast.fire({icon: 'error', title: data.message ??  'Ha ocurrido un error al crear el turno' })
      //    }
      //  }, error:()=>{
      //    this.homesvc.loading.emit(false)
      //    this.homesvc.toast.fire({icon: 'error', title: 'No se creo el turno' })
      //  }
      //})
    }else{
      this.homesvc.toast.fire({text:'Formulario invalido', icon:'error'})
    }
  }
}
