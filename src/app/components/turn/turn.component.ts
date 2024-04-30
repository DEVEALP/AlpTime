import { Component  } from '@angular/core';

@Component({
  selector: 'app-turn',
  templateUrl: './turn.component.html',
  styleUrls: ['./turn.component.css']
})
export class TurnComponent {
  
  view_table = 'calendar'
  loading = false

  ngOnInit(){
  }

  seletedtab(tab:string){
    this.view_table = tab
  }
}
