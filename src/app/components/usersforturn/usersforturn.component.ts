import { Component, Inject, LOCALE_ID  } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Pipe, PipeTransform } from '@angular/core';
import localeEs from '@angular/common/locales/es';

@Component({
  selector: 'app-usersforturn',
  templateUrl: './usersforturn.component.html',
  styleUrls: ['./usersforturn.component.css']
})
export class UsersforturnComponent {

  constructor(public dialogRef: MatDialogRef<UsersforturnComponent>, @Inject(MAT_DIALOG_DATA) public data: any ) {
    data.day = this.transform(data.day)
  }
  
  ngOnInit(){
    console.log(this.data)
  }

  closed(): void {
    this.dialogRef.close();
  }
  transform(value: string): string {
    const date = new Date(value);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('es', options);
  }
}
