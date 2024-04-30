import { Component, Inject } from '@angular/core';
import { DateRange } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-turn',
  templateUrl: './select-turn.component.html',
  styleUrls: ['./select-turn.component.css']
})
export class SelectTurnComponent {

  turn:any = {}
  selectedDateRange: any;
  left = false
  items:any = []
  constructor(public dialogRef: MatDialogRef<SelectTurnComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
  ngOnInit(){
    this.items = this.data.list;
    setTimeout(()=>{ document.getElementById('input')?.focus(); }, 500)
  }
  search(e:any){
    var val = e.target.value
    this.items = this.data.data.filter((option:any) => option.nombre.toLowerCase().includes(val));
  }
  closing(): void {
    this.dialogRef.close();
  }
  selected(data:any): void {
    this.turn = data;
    if(this.data.type){
      this.left = true
    }else{
      this.dialogRef.close(data);
    }
  }
  save(){
    this.dialogRef.close({turn:this.turn, range:this.selectedDateRange});
  }
  _onSelectedChange(date: Date): void {
    if (this.selectedDateRange && this.selectedDateRange.start && date >= this.selectedDateRange.start && !this.selectedDateRange.end) {
      this.selectedDateRange = new DateRange( this.selectedDateRange.start, date );
      setTimeout(() => { document.getElementById('btnnext')?.focus(); }, 100);
    } else {
      this.selectedDateRange = new DateRange(date, null);
    }
  }
}
