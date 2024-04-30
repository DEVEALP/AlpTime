import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpRequest } from 'src/app/services/HttpRequest';
import { HomeService } from 'src/app/services/home.service';

@Component({
  selector: 'app-employes',
  templateUrl: './employes.component.html',
  styleUrls: ['./employes.component.css']
})
export class EmployesComponent {

  loading = false
  loadFilter = false
  filtercount = 0
  employes:any[] = []

  constructor(private http:HttpRequest, private home:HomeService, private dialog:MatDialog) { }

  ngOnInit(): void {
    this.load()
  }

  setFilter(){

  }
  
  load(){

  }

  add(){

  }
}
