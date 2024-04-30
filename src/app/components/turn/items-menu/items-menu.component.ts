import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-items-menu',
  templateUrl: './items-menu.component.html',
  styleUrls: ['./items-menu.component.css']
})
export class ItemsMenuComponent {

  items:any = []
  constructor(public dialogRef: MatDialogRef<ItemsMenuComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}
  ngOnInit(){
    this.items = this.data.data;
    setTimeout(()=>{
      document.getElementById('input')?.focus();
    }, 500)
  }
  search(e:any){
    var val = e.target.value
    this.items = this.data.data.filter((option:any) => option.nombre.toLowerCase().includes(val));
    console.log();
  }
  closing(): void {
    this.dialogRef.close();
  }
  selected(data:any): void {
    this.dialogRef.close(data);
  }
}
