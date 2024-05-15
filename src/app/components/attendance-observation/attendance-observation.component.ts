import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-attendance-observation',
  templateUrl: './attendance-observation.component.html',
  styleUrls: ['./attendance-observation.component.css']
})
export class AttendanceObservationComponent {

  observation = new FormControl('');

  constructor(private home:HomeService, public dialogRef: MatDialogRef<AttendanceObservationComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.observation.setValue(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  save(){
    this.dialogRef.close(this.observation.value);
  }
}
