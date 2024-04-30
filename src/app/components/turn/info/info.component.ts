import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';
import { newHttpRequest } from 'src/app/services/newHttpRequest';

@Component({
  selector: 'app-info-turns',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoTComponent {


  property = ''
  order = ''
  timer:any = null
  old_search = ''
  text = new FormControl('')
  mobile = window.innerWidth < 601
  turns:any = []
  list:any = []

  constructor(public dialog: MatDialog, private homesvc:HomeService, private http:newHttpRequest){}
  
  ngOnInit(){
    this.list = this.turns;
    this.load_turnsp()
  }
  
  add(){
    this.homesvc.changepage.emit('add_turn')
    this.homesvc.setreturn.emit({new_name: 'Agregar turno', action: ()=> this.homesvc.changepage.emit('turns') })
  }
  writing(){
    clearInterval(this.timer);
    this.timer = setInterval(()=>{
      if(this.text.value != this.old_search){ this.old_search = this.text.value ?? '';this.load_turns() }
      clearInterval(this.timer);
    }, 600)
  }
  load_turns(){
    this.list = this.turns.filter((option:any) => option.turn_name.toLowerCase().includes(this.text.value ?? ''));
    if(this.property != '' && this.order != ''){
      if(this.order == 'desc'){
        this.list = this.list.sort((a:any, b:any) => a[this.property]?.toString().toLowerCase() > b[this.property]?.toString().toLowerCase() ? 1 : -1);
      }else{
        this.list = this.list.sort((a:any, b:any) => a[this.property]?.toString().toLowerCase() < b[this.property]?.toString().toLowerCase() ? 1 : -1);
      }
    }
  }
  load_turnsp(){
    this.homesvc.loading.emit(true)
    this.http.post('turn/get' , { value: this.text.value ?? ''}).then((e:any)=>{
      this.turns = e;
      this.load_turns()
      this.homesvc.loading.emit(false)
      console.log(this.turns)
    }).catch((e:any)=>{
      this.homesvc.loading.emit(false)
    })
  }
  changeOrder(property:string){
    if(this.property == property){
      if(this.order == 'asc'){ this.order = 'desc' }else{ this.order = 'asc' }
    }else{
      this.property = property;
      this.order = 'asc'
    }
    this.load_turns();
  }
}
