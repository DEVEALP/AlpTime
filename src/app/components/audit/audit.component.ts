import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent {

  istext = true
  order = ''
  property = ''
  view = {entrance:true, exit:true, repeated:true, lunch_entrance:true, lunch_outing:true }
  old_search = ''
  timer:any = null
  text = new FormControl<string>('')
  start = new FormControl<Date | null>(null)
  end = new FormControl<Date | null>(null)
  audits:any = []
  mobile = innerWidth < 600
  device:any = {id:0, name:''}

  constructor(private homesvc:HomeService){}
  ngOnInit(){
    this.load();
  }
  writing(){
    clearInterval(this.timer);
    this.timer = setInterval(()=>{
      if(this.text.value != this.old_search){ this.load() }
      clearInterval(this.timer);
    }, 800)
  }
  load(){
    this.old_search = this.text.value ?? ''
    var body = { text: this.text.value, start: this.start.value, end: this.end.value, order: this.order }
    this.homesvc.loading.emit(true) 
  }
  changeOrder(property:string){
    if(this.property == property){
      if(this.order == 'asc'){ this.order = 'desc' }else{ this.order = 'asc' }
    }else{
      this.property = property;
      this.order = 'asc'
    }
    this.load();
  }
  changeType(){
    this.text.setValue('');
    this.start.setValue(null);
    this.end.setValue(null);
    this.istext = !this.istext
  }
  changedate(){
    if(this.start.value != null && this.end.value != null) this.load() 
  }
  changeView(){
    console.log(this.view);
  }
  changeorder(){
    if(this.order == 'asc'){ 
      this.order = 'desc'
    }else{
      this.order = 'asc'
    }
  }
}
